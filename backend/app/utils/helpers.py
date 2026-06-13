import base64
import os
import tempfile
import time
import functools
from app.core.logging import get_logger

logger = get_logger(__name__)


def decode_base64_audio(audio_base64: str, suffix: str = ".mp3") -> str:
    audio_bytes = base64.b64decode(audio_base64)
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(audio_bytes)
    tmp.flush()
    tmp.close()
    return tmp.name


def cleanup_file(path: str) -> None:
    try:
        if path and os.path.exists(path):
            os.unlink(path)
    except Exception as e:
        logger.warning("cleanup_failed", path=path, error=str(e))


def timer(name: str):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            t0 = time.perf_counter()
            result = fn(*args, **kwargs)
            elapsed = round(time.perf_counter() - t0, 2)
            logger.info("stage_timing", stage=name, seconds=elapsed)
            return result
        return wrapper
    return decorator
