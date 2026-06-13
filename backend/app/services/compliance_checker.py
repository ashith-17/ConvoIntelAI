import json
from app.core.logging import get_logger
from app.services.llm_client import get_llm_response

logger = get_logger(__name__)

COMPLIANCE_PROMPT = """You are a compliance officer auditing customer service calls.

Evaluate whether the agent followed required compliance and quality standards.

Check for:
- greeting: Did agent properly greet and identify themselves?
- identification: Did agent verify customer identity?
- disclosure: Did agent provide required disclosures or terms?
- resolution: Did agent attempt to resolve the issue?
- closing: Did agent summarize and properly close the call?
- profanity_free: Was the call free of inappropriate language?
- data_privacy: Did agent avoid sharing sensitive data inappropriately?

Provide:
- compliance_score: 0.0 to 1.0 (fraction of checks passed)
- checks: object with each check as true/false
- violations: list of specific violations found
- adherence_status: "followed", "partial", "not_followed"
- explanation: brief explanation of compliance assessment

Respond ONLY with valid JSON:
{
  "compliance_score": 0.75,
  "checks": {
    "greeting": true,
    "identification": true,
    "disclosure": false,
    "resolution": true,
    "closing": false,
    "profanity_free": true,
    "data_privacy": true
  },
  "violations": ["No closing summary provided", "Missing required disclosure"],
  "adherence_status": "partial",
  "explanation": "Agent greeted and resolved the issue but skipped disclosure and closing"
}"""


def check_compliance(transcript: str) -> dict:
    if not transcript:
        return _default_compliance()

    raw = get_llm_response(
        system_prompt=COMPLIANCE_PROMPT,
        user_prompt=f"Transcript:\n{transcript}",
        max_tokens=600,
        temperature=0.0,
        require_json=True,
    )

    if not raw:
        return _default_compliance()

    try:
        parsed = json.loads(raw)
        score = float(parsed.get("compliance_score", 0.5))
        score = max(0.0, min(1.0, round(score, 2)))

        status = parsed.get("adherence_status", "partial")
        if status not in ("followed", "partial", "not_followed"):
            status = "partial"

        checks = parsed.get("checks", {})
        valid_checks = ["greeting", "identification", "disclosure",
                        "resolution", "closing", "profanity_free", "data_privacy"]
        validated_checks = {k: bool(checks.get(k, False)) for k in valid_checks}

        return {
            "compliance_score": score,
            "checks": validated_checks,
            "violations": [str(v) for v in parsed.get("violations", [])[:6]],
            "adherence_status": status,
            "explanation": str(parsed.get("explanation", ""))[:400],
        }
    except (json.JSONDecodeError, Exception) as e:
        logger.warning("compliance_parse_failed", error=str(e))
        return _default_compliance()


def _default_compliance() -> dict:
    return {
        "compliance_score": 0.0,
        "checks": {
            "greeting": False, "identification": False, "disclosure": False,
            "resolution": False, "closing": False, "profanity_free": True, "data_privacy": True,
        },
        "violations": [],
        "adherence_status": "not_followed",
        "explanation": "Unable to assess compliance.",
    }
