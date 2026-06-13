import json
from app.core.logging import get_logger
from app.services.llm_client import get_llm_response

logger = get_logger(__name__)

INTENT_PROMPT = """You are a customer intent classification expert.

Analyze the transcript and identify the customer's primary and secondary intents.

Intent categories:
- "Purchase": Customer wants to buy a product or service
- "Complaint": Customer is reporting a problem or expressing dissatisfaction
- "Inquiry": Customer is asking for information
- "Cancellation": Customer wants to cancel a subscription or order
- "Support": Customer needs technical or account support
- "Renewal": Customer wants to renew a service or contract
- "Refund": Customer wants money back
- "Unknown": Cannot determine intent

Respond ONLY with valid JSON:
{
  "primary_intent": "Complaint",
  "secondary_intent": "Support",
  "confidence": 92,
  "intent_signals": [
    "Customer mentioned 'broken product' twice",
    "Asked for replacement or refund"
  ],
  "topic": "Billing issue with monthly subscription"
}"""


def detect_intent(transcript: str) -> dict:
    if not transcript:
        return _default_intent()

    raw = get_llm_response(
        system_prompt=INTENT_PROMPT,
        user_prompt=f"Transcript:\n{transcript}",
        max_tokens=400,
        temperature=0.0,
        require_json=True,
    )

    if not raw:
        return _rule_based_intent(transcript)

    try:
        parsed = json.loads(raw)
        valid_intents = {"Purchase", "Complaint", "Inquiry", "Cancellation",
                         "Support", "Renewal", "Refund", "Unknown"}

        primary = parsed.get("primary_intent", "Unknown")
        secondary = parsed.get("secondary_intent", "Unknown")
        if primary not in valid_intents:
            primary = "Unknown"
        if secondary not in valid_intents:
            secondary = "Unknown"

        confidence = int(parsed.get("confidence", 70))
        confidence = max(0, min(100, confidence))

        return {
            "primary_intent": primary,
            "secondary_intent": secondary,
            "confidence": confidence,
            "intent_signals": [str(s) for s in parsed.get("intent_signals", [])[:4]],
            "topic": str(parsed.get("topic", "General inquiry"))[:150],
        }
    except (json.JSONDecodeError, Exception) as e:
        logger.warning("intent_parse_failed", error=str(e))
        return _rule_based_intent(transcript)


def _rule_based_intent(transcript: str) -> dict:
    t = transcript.lower()
    intents = {
        "Complaint": ["problem", "issue", "broken", "not working", "fault", "error", "complaint"],
        "Cancellation": ["cancel", "cancellation", "terminate", "stop subscription"],
        "Refund": ["refund", "money back", "reimburs", "return"],
        "Purchase": ["buy", "purchase", "order", "want to get", "interested in"],
        "Support": ["help", "assist", "support", "how do i", "can you help"],
        "Inquiry": ["what is", "how much", "when", "where", "information", "tell me"],
        "Renewal": ["renew", "renewal", "extend", "continue"],
    }
    for intent, keywords in intents.items():
        if any(kw in t for kw in keywords):
            return {
                "primary_intent": intent,
                "secondary_intent": "Unknown",
                "confidence": 60,
                "intent_signals": [f"Keyword match: {intent}"],
                "topic": "Detected via keyword analysis",
            }
    return _default_intent()


def _default_intent() -> dict:
    return {
        "primary_intent": "Unknown",
        "secondary_intent": "Unknown",
        "confidence": 0,
        "intent_signals": [],
        "topic": "Unable to determine",
    }
