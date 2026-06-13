import json
from app.core.logging import get_logger
from app.services.llm_client import get_llm_response

logger = get_logger(__name__)

OBJECTION_PROMPT = """You are a sales and customer service objection analysis expert.

Detect all customer objections raised during this call.

For each objection identify:
- type: category of objection (e.g. "Price", "Trust", "Timing", "Need", "Competition", "Feature", "Contract")
- statement: exact or paraphrased quote from customer
- severity: "Low", "Medium", or "High" (how much this objection risks losing the customer)
- was_addressed: true if the agent addressed this objection, false if not

Respond ONLY with valid JSON:
{
  "objections": [
    {
      "type": "Price",
      "statement": "This is too expensive for what it offers",
      "severity": "High",
      "was_addressed": false
    }
  ],
  "total_objections": 2,
  "unaddressed_count": 1,
  "objection_summary": "Customer raised 2 objections around price and timing, agent only addressed one"
}"""


def detect_objections(transcript: str) -> dict:
    if not transcript:
        return _default_objections()

    raw = get_llm_response(
        system_prompt=OBJECTION_PROMPT,
        user_prompt=f"Transcript:\n{transcript}",
        max_tokens=700,
        temperature=0.1,
        require_json=True,
    )

    if not raw:
        return _default_objections()

    try:
        parsed = json.loads(raw)
        objections = []
        for obj in parsed.get("objections", []):
            severity = obj.get("severity", "Medium")
            if severity not in ("Low", "Medium", "High"):
                severity = "Medium"
            objections.append({
                "type": str(obj.get("type", "General"))[:50],
                "statement": str(obj.get("statement", ""))[:200],
                "severity": severity,
                "was_addressed": bool(obj.get("was_addressed", False)),
            })

        return {
            "objections": objections[:8],
            "total_objections": int(parsed.get("total_objections", len(objections))),
            "unaddressed_count": int(parsed.get("unaddressed_count", sum(1 for o in objections if not o["was_addressed"]))),
            "objection_summary": str(parsed.get("objection_summary", ""))[:300],
        }
    except (json.JSONDecodeError, Exception) as e:
        logger.warning("objection_parse_failed", error=str(e))
        return _default_objections()


def _default_objections() -> dict:
    return {
        "objections": [],
        "total_objections": 0,
        "unaddressed_count": 0,
        "objection_summary": "No objections detected.",
    }
