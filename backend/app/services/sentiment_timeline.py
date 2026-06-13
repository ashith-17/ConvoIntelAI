import json
from app.core.logging import get_logger
from app.services.llm_client import get_llm_response
from app.utils.enums import EmotionLabel

logger = get_logger(__name__)

SENTIMENT_TIMELINE_PROMPT = """You are an emotion analysis expert for customer support calls.

Analyze the transcript and identify emotion shifts throughout the call.
Divide the transcript into segments and assign an emotion to each segment.

For each segment provide:
- timestamp: approximate time in the call (e.g. "0:00", "2:30", "5:20")
- emotion: one of "Happy", "Satisfied", "Neutral", "Confused", "Frustrated", "Angry"
- text_snippet: a short (max 15 word) quote from that segment
- score: sentiment score from -1.0 (very negative) to 1.0 (very positive)

Rules:
- Identify 4-8 meaningful emotion shifts
- Start with the opening tone
- Capture escalations and de-escalations
- End with the closing emotion

Respond ONLY with valid JSON:
{
  "timeline": [
    {
      "timestamp": "0:00",
      "emotion": "Neutral",
      "text_snippet": "Hello, I am calling about...",
      "score": 0.0
    }
  ],
  "dominant_emotion": "Frustrated",
  "emotion_journey": "Started neutral, escalated to frustrated, resolved satisfied"
}"""


def extract_sentiment_timeline(transcript: str) -> dict:
    if not transcript:
        return _default_timeline()

    raw = get_llm_response(
        system_prompt=SENTIMENT_TIMELINE_PROMPT,
        user_prompt=f"Transcript:\n{transcript}",
        max_tokens=1000,
        temperature=0.1,
        require_json=True,
    )

    if not raw:
        return _default_timeline()

    try:
        parsed = json.loads(raw)
        timeline = parsed.get("timeline", [])
        validated = []
        valid_emotions = {e.value for e in EmotionLabel}
        for item in timeline:
            emotion = item.get("emotion", "Neutral")
            if emotion not in valid_emotions:
                emotion = "Neutral"
            score = float(item.get("score", 0.0))
            score = max(-1.0, min(1.0, score))
            validated.append({
                "timestamp": str(item.get("timestamp", "0:00")),
                "emotion": emotion,
                "text_snippet": str(item.get("text_snippet", ""))[:100],
                "score": score,
            })
        return {
            "timeline": validated,
            "dominant_emotion": str(parsed.get("dominant_emotion", "Neutral")),
            "emotion_journey": str(parsed.get("emotion_journey", "")),
        }
    except (json.JSONDecodeError, Exception) as e:
        logger.warning("sentiment_timeline_parse_failed", error=str(e))
        return _default_timeline()


def _default_timeline() -> dict:
    return {
        "timeline": [
            {"timestamp": "0:00", "emotion": "Neutral", "text_snippet": "Call started", "score": 0.0}
        ],
        "dominant_emotion": "Neutral",
        "emotion_journey": "Unable to analyze emotion timeline.",
    }
