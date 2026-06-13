import os
import re
import subprocess
import tempfile
import hashlib
from typing import Optional

from app.core.logging import get_logger
from app.utils.helpers import timer

logger = get_logger(__name__)

LANG_MAP = {
    "Tamil": "ta", "Hindi": "hi",
    "tamil": "ta", "hindi": "hi",
    "ta": "ta", "hi": "hi",
    "Auto-Detect": None, "auto-detect": None,
}


def _convert_to_wav(input_path: str) -> tuple:
    """Convert any audio to 16kHz mono WAV using ffmpeg."""
    out_path = tempfile.mktemp(suffix=".wav")
    cmd = [
        "ffmpeg", "-y", "-i", input_path,
        "-ar", "16000", "-ac", "1",
        "-f", "wav", out_path,
    ]
    try:
        proc = subprocess.run(cmd, capture_output=True, timeout=120)
        if proc.returncode != 0:
            stderr = proc.stderr.decode("utf-8", errors="replace")[-500:]
            logger.warning("ffmpeg_failed", stderr=stderr)
            return input_path, False
        size_kb = os.path.getsize(out_path) / 1024
        logger.info("audio_converted", size_kb=round(size_kb, 1))
        return out_path, True
    except FileNotFoundError:
        logger.warning("ffmpeg_not_found")
        return input_path, False
    except Exception as exc:
        logger.warning("ffmpeg_error", error=str(exc))
        try:
            if os.path.exists(out_path):
                os.unlink(out_path)
        except Exception:
            pass
        return input_path, False


def _convert_to_mp3(input_path: str) -> tuple:
    """
    Convert audio to MP3 (192kbps) as a fallback when WAV produces empty transcript.
    Some Whisper endpoints handle MP3 better than raw WAV for certain codecs.
    """
    out_path = tempfile.mktemp(suffix=".mp3")
    cmd = [
        "ffmpeg", "-y", "-i", input_path,
        "-ar", "16000", "-ac", "1",
        "-b:a", "192k",
        "-f", "mp3", out_path,
    ]
    try:
        proc = subprocess.run(cmd, capture_output=True, timeout=120)
        if proc.returncode != 0:
            stderr = proc.stderr.decode("utf-8", errors="replace")[-300:]
            logger.warning("ffmpeg_mp3_failed", stderr=stderr)
            return input_path, False
        size_kb = os.path.getsize(out_path) / 1024
        logger.info("audio_converted_mp3", size_kb=round(size_kb, 1))
        return out_path, True
    except Exception as exc:
        logger.warning("ffmpeg_mp3_error", error=str(exc))
        return input_path, False


def _probe_audio(path: str) -> dict:
    """
    Run ffprobe to get audio stream info — duration, codec, sample rate.
    Returns empty dict on failure.
    """
    try:
        cmd = [
            "ffprobe", "-v", "quiet", "-print_format", "json",
            "-show_streams", "-select_streams", "a", path,
        ]
        proc = subprocess.run(cmd, capture_output=True, timeout=15)
        if proc.returncode == 0:
            import json
            data = json.loads(proc.stdout.decode())
            streams = data.get("streams", [])
            if streams:
                s = streams[0]
                info = {
                    "codec": s.get("codec_name", "unknown"),
                    "duration": float(s.get("duration", 0)),
                    "sample_rate": int(s.get("sample_rate", 0)),
                    "channels": int(s.get("channels", 0)),
                }
                logger.info("audio_probed", **info)
                return info
    except Exception as exc:
        logger.warning("ffprobe_error", error=str(exc))
    return {}


def _call_groq_transcription(client, audio_path: str, lang_code: Optional[str]) -> str:
    """
    Call Groq transcriptions endpoint (keeps original language).
    Returns transcript string or empty string.
    """
    try:
        with open(audio_path, "rb") as f:
            kwargs = dict(
                model="whisper-large-v3-turbo",
                file=f,
                response_format="verbose_json",
                temperature=0.0,
            )
            if lang_code:
                kwargs["language"] = lang_code
            response = client.audio.transcriptions.create(**kwargs)
        transcript = (response.text or "").strip()
        detected = getattr(response, "language", lang_code or "unknown")
        logger.info("groq_transcription_result", chars=len(transcript), lang=detected)
        return transcript
    except Exception as exc:
        logger.warning("groq_transcription_error", error=str(exc))
        return ""


def _call_groq_translation(client, audio_path: str) -> str:
    """
    Call Groq translations endpoint (always outputs English).
    Used as fallback when transcription returns empty.
    """
    try:
        with open(audio_path, "rb") as f:
            response = client.audio.translations.create(
                model="whisper-large-v3-turbo",
                file=f,
                response_format="verbose_json",
                temperature=0.0,
            )
        transcript = (response.text or "").strip()
        logger.info("groq_translation_result", chars=len(transcript))
        return transcript
    except Exception as exc:
        logger.warning("groq_translation_error", error=str(exc))
        return ""


def _transcribe_with_groq(audio_path: str, lang_code: Optional[str]) -> Optional[str]:
    """
    Multi-strategy Groq Whisper transcription.

    Strategy order:
    1. transcriptions endpoint with WAV + language hint (best for Hindi/Tamil)
    2. transcriptions endpoint with WAV + no language hint (let Whisper auto-detect)
    3. translations endpoint with WAV (English output fallback)
    4. Convert to MP3, retry transcriptions (codec compatibility fallback)
    5. translations endpoint with MP3 (last resort)

    Each strategy is tried only if the previous returned empty.
    """
    key = os.environ.get("GROQ_API_KEY", "").strip()
    if not key or len(key) < 10:
        logger.error("groq_key_missing")
        return None

    try:
        from groq import Groq
        client = Groq(api_key=key)

        file_size_mb = os.path.getsize(audio_path) / (1024 * 1024)
        logger.info("groq_stt_start", size_mb=round(file_size_mb, 3), lang=lang_code)

        # ── Strategy 1: WAV + language hint ──────────────────────────────
        transcript = _call_groq_transcription(client, audio_path, lang_code)
        if transcript:
            logger.info("groq_stt_success", strategy=1)
            return transcript

        # ── Strategy 2: WAV + no language hint (auto-detect) ─────────────
        if lang_code:  # only retry without hint if we had one
            logger.warning("strategy1_empty_trying_auto_detect")
            transcript = _call_groq_transcription(client, audio_path, None)
            if transcript:
                logger.info("groq_stt_success", strategy=2)
                return transcript

        # ── Strategy 3: WAV translations endpoint (→ English) ────────────
        logger.warning("strategy2_empty_trying_translations")
        transcript = _call_groq_translation(client, audio_path)
        if transcript:
            logger.info("groq_stt_success", strategy=3)
            return transcript

        # ── Strategy 4: Convert to MP3, retry transcriptions ─────────────
        logger.warning("strategy3_empty_trying_mp3_conversion")
        mp3_path, mp3_ok = _convert_to_mp3(audio_path)
        mp3_is_temp = mp3_ok and mp3_path != audio_path

        try:
            transcript = _call_groq_transcription(client, mp3_path, lang_code)
            if transcript:
                logger.info("groq_stt_success", strategy=4)
                return transcript

            # ── Strategy 5: MP3 translations (last resort) ────────────────
            logger.warning("strategy4_empty_trying_mp3_translations")
            transcript = _call_groq_translation(client, mp3_path)
            if transcript:
                logger.info("groq_stt_success", strategy=5)
                return transcript
        finally:
            if mp3_is_temp and os.path.exists(mp3_path):
                try:
                    os.unlink(mp3_path)
                except Exception:
                    pass

        # All strategies exhausted
        logger.error("groq_all_strategies_empty", lang=lang_code, size_mb=round(file_size_mb, 3))
        return None

    except Exception as exc:
        logger.error("groq_stt_failed", error=str(exc))
        return None


def _dedup(text: str) -> str:
    if not text:
        return text
    sents = [s.strip() for s in re.split(r"(?<=[.!?।\n])\s*", text) if s.strip()]
    out, window = [], []
    for s in sents:
        h = hashlib.md5(re.sub(r"[^\w]", "", s.lower()).encode()).hexdigest()
        if h not in window:
            out.append(s)
            window.append(h)
            if len(window) > 3:
                window.pop(0)
    return " ".join(out)


def _cleanup(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"[ \t]+", " ", text)
    for pat in [r"\[Music\]", r"\[Applause\]", r"\[Inaudible\]",
                r"\bthanks for watching\b", r"\bplease subscribe\b"]:
        text = re.sub(pat, "", text, flags=re.IGNORECASE)
    return _dedup(text).strip()


@timer("speech_to_text")
def transcribe_audio(audio_path: str, language: str) -> dict:
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    lang_code = LANG_MAP.get(language) or LANG_MAP.get(language.lower())
    size_kb = round(os.path.getsize(audio_path) / 1024, 1)
    logger.info("stt_start", language=language, lang_code=lang_code, size_kb=size_kb)

    # Probe audio file to catch issues early (duration=0 means corrupt/silent)
    probe = _probe_audio(audio_path)
    duration = probe.get("duration", -1)
    if duration == 0:
        logger.error("stt_audio_zero_duration", path=audio_path)
        return {"transcript": "", "detected_language": lang_code or language, "provider": "groq_whisper", "error": "audio_zero_duration"}

    # Check minimum file size — Whisper needs at least ~1KB of actual audio
    if size_kb < 1:
        logger.error("stt_audio_too_small", size_kb=size_kb)
        return {"transcript": "", "detected_language": lang_code or language, "provider": "groq_whisper", "error": "audio_too_small"}

    wav_path, is_temp = _convert_to_wav(audio_path)
    try:
        # Verify WAV conversion produced a real file
        if is_temp:
            wav_size_kb = os.path.getsize(wav_path) / 1024
            logger.info("wav_size_kb", size=round(wav_size_kb, 1))
            if wav_size_kb < 1:
                logger.error("wav_conversion_produced_empty_file")
                # Fall back to original path
                wav_path = audio_path
                is_temp = False

        transcript = _transcribe_with_groq(wav_path, lang_code)
        if transcript is None:
            logger.error("stt_failed_no_transcript")
            return {
                "transcript": "",
                "detected_language": lang_code or language,
                "provider": "groq_whisper",
                "error": "all_strategies_exhausted",
            }
        clean = _cleanup(transcript)
        logger.info("stt_complete", raw_chars=len(transcript), clean_chars=len(clean))
        return {"transcript": clean, "detected_language": lang_code or language, "provider": "groq_whisper"}
    finally:
        if is_temp and wav_path != audio_path and os.path.exists(wav_path):
            try:
                os.unlink(wav_path)
            except Exception:
                pass