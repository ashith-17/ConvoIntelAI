import json
from app.core.logging import get_logger
from app.services.llm_client import get_llm_response

logger = get_logger(__name__)

CHURN_PROMPT = """You are a customer retention specialist and data scientist.

Analyze this call transcript and predict the customer's churn risk.

Assess based on:
- Sentiment and emotion trajectory (did they get angrier or calmer?)
- Complaint frequency (repeated issues mentioned?)
- Resolution success (was their problem solved?)
- Explicit threats or hints of leaving ("I'll cancel", "switching to competitor")
- Satisfaction signals at the end of call
- Language expressing frustration, disappointment, or dissatisfaction

Output:
- churn_probability: percentage 0-100 (likelihood customer will churn)
- risk_level: "Low" (0-30%), "Medium" (31-60%), "High" (61-100%)
- reasons: list of 2-4 specific reasons from the transcript driving this prediction
- retention_suggestions: list of 2-3 actionable things the company can do to retain this customer

Respond ONLY with valid JSON:
{
  "churn_probability": 72,
  "risk_level": "High",
  "reasons": [
    "Customer complained about billing 3 times without resolution",
    "Expressed frustration repeatedly",
    "No concrete resolution offered by agent"
  ],
  "retention_suggestions": [
    "Proactive follow-up call within 24 hours",
    "Offer billing adjustment or goodwill credit",
    "Escalate to senior support team"
  ]
}"""


def predict_churn(transcript: str, summary: str) -> dict:
    if not transcript:
        return _default_churn()

    combined = f"Transcript:\n{transcript}\n\nSummary:\n{summary}"
    raw = get_llm_response(
        system_prompt=CHURN_PROMPT,
        user_prompt=combined,
        max_tokens=600,
        temperature=0.1,
        require_json=True,
    )

    if not raw:
        return _rule_based_churn(transcript)

    try:
        parsed = json.loads(raw)
        prob = int(parsed.get("churn_probability", 50))
        prob = max(0, min(100, prob))

        risk = parsed.get("risk_level", "Medium")
        if risk not in ("Low", "Medium", "High"):
            risk = "High" if prob >= 61 else ("Medium" if prob >= 31 else "Low")

        return {
            "churn_probability": prob,
            "risk_level": risk,
            "reasons": [str(r) for r in parsed.get("reasons", [])[:4]],
            "retention_suggestions": [str(s) for s in parsed.get("retention_suggestions", [])[:3]],
        }
    except (json.JSONDecodeError, Exception) as e:
        logger.warning("churn_parse_failed", error=str(e))
        return _rule_based_churn(transcript)


def _rule_based_churn(transcript: str) -> dict:
    t = transcript.lower()
    score = 30  # baseline
    reasons = []

    high_risk_phrases = [
        "cancel", "cancellation", "switch", "competitor", "leaving", "never again",
        "worst", "unacceptable", "refund", "sue", "complaint", "escalate"
    ]
    medium_risk_phrases = [
        "frustrated", "angry", "upset", "disappointed", "unhappy", "problem again",
        "not resolved", "still broken", "useless"
    ]

    for phrase in high_risk_phrases:
        if phrase in t:
            score += 15
            reasons.append(f"Customer used high-risk phrase: '{phrase}'")

    for phrase in medium_risk_phrases:
        if phrase in t:
            score += 7

    score = min(100, score)
    risk = "High" if score >= 61 else ("Medium" if score >= 31 else "Low")

    return {
        "churn_probability": score,
        "risk_level": risk,
        "reasons": reasons[:4] or ["Insufficient data for detailed analysis"],
        "retention_suggestions": [
            "Follow up within 48 hours",
            "Offer service credit or discount",
            "Assign dedicated support agent",
        ],
    }


def _default_churn() -> dict:
    return {
        "churn_probability": 0,
        "risk_level": "Low",
        "reasons": [],
        "retention_suggestions": [],
    }
