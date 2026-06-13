import json
from app.core.logging import get_logger
from app.services.llm_client import get_llm_response

logger = get_logger(__name__)

AGENT_SCORECARD_PROMPT = """You are a call center quality assurance expert.

Evaluate the agent's performance on this call and provide scores from 0 to 100 for each dimension.

Scoring criteria:
- communication (0-100): Clarity, vocabulary, articulation, tone of voice, pacing
- professionalism (0-100): Politeness, composure, respect, brand alignment
- listening_skills (0-100): Active listening, not interrupting, addressing customer concerns accurately
- resolution_quality (0-100): Problem-solving effectiveness, accuracy of information provided
- empathy (0-100): Acknowledging feelings, showing understanding, emotional intelligence

Also provide:
- overall_score: weighted average (communication 20%, professionalism 20%, listening 20%, resolution 25%, empathy 15%)
- strengths: list of 2-3 things the agent did well
- improvements: list of 2-3 areas for improvement
- grade: "Excellent" (90+), "Good" (75-89), "Average" (60-74), "Needs Improvement" (<60)

Respond ONLY with valid JSON:
{
  "communication": 85,
  "professionalism": 90,
  "listening_skills": 80,
  "resolution_quality": 78,
  "empathy": 92,
  "overall_score": 84,
  "strengths": ["Clear communication", "Showed empathy"],
  "improvements": ["Could resolve faster", "Needs to ask clarifying questions"],
  "grade": "Good"
}"""


def evaluate_agent(transcript: str, summary: str) -> dict:
    if not transcript:
        return _default_scorecard()

    combined = f"Transcript:\n{transcript}\n\nSummary:\n{summary}"
    raw = get_llm_response(
        system_prompt=AGENT_SCORECARD_PROMPT,
        user_prompt=combined,
        max_tokens=600,
        temperature=0.1,
        require_json=True,
    )

    if not raw:
        return _default_scorecard()

    try:
        parsed = json.loads(raw)

        def clamp(val, default=70):
            try:
                return max(0, min(100, int(val)))
            except (TypeError, ValueError):
                return default

        comm = clamp(parsed.get("communication", 70))
        prof = clamp(parsed.get("professionalism", 70))
        listen = clamp(parsed.get("listening_skills", 70))
        resolution = clamp(parsed.get("resolution_quality", 70))
        empathy = clamp(parsed.get("empathy", 70))
        overall = clamp(parsed.get("overall_score", int(
            comm * 0.2 + prof * 0.2 + listen * 0.2 + resolution * 0.25 + empathy * 0.15
        )))

        grade = parsed.get("grade", "Average")
        if grade not in ("Excellent", "Good", "Average", "Needs Improvement"):
            grade = _compute_grade(overall)

        return {
            "communication": comm,
            "professionalism": prof,
            "listening_skills": listen,
            "resolution_quality": resolution,
            "empathy": empathy,
            "overall_score": overall,
            "strengths": [str(s) for s in parsed.get("strengths", [])[:3]],
            "improvements": [str(s) for s in parsed.get("improvements", [])[:3]],
            "grade": grade,
        }
    except (json.JSONDecodeError, Exception) as e:
        logger.warning("agent_scorecard_parse_failed", error=str(e))
        return _default_scorecard()


def _compute_grade(score: int) -> str:
    if score >= 90:
        return "Excellent"
    if score >= 75:
        return "Good"
    if score >= 60:
        return "Average"
    return "Needs Improvement"


def _default_scorecard() -> dict:
    return {
        "communication": 0,
        "professionalism": 0,
        "listening_skills": 0,
        "resolution_quality": 0,
        "empathy": 0,
        "overall_score": 0,
        "strengths": [],
        "improvements": [],
        "grade": "Average",
    }
