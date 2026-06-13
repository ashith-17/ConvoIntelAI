import json
from app.core.logging import get_logger
from app.services.llm_client import get_llm_response

logger = get_logger(__name__)

ACTION_ITEMS_PROMPT = """You are a business process expert analyzing customer service calls.

Extract all action items from this call — things that need to happen AFTER the call ends.

For each action item:
- action: specific task to be done
- owner: "Agent", "Team Lead", "Technical Team", "Customer", or "Management"
- priority: "High", "Medium", or "Low"
- deadline: suggested deadline (e.g. "Within 24 hours", "Within 1 week", "Immediate")
- category: "Follow-up", "Resolution", "Escalation", "Documentation", "Training", "Compensation"

Also provide:
- summary: brief overall summary of next steps
- escalation_required: true if this needs escalation to management

Respond ONLY with valid JSON:
{
  "action_items": [
    {
      "action": "Send customer the refund confirmation email",
      "owner": "Agent",
      "priority": "High",
      "deadline": "Within 24 hours",
      "category": "Resolution"
    }
  ],
  "summary": "Agent must process refund and follow up with customer within 24 hours",
  "escalation_required": false
}"""


def generate_action_items(transcript: str, summary: str) -> dict:
    if not transcript:
        return _default_actions()

    combined = f"Transcript:\n{transcript}\n\nSummary:\n{summary}"
    raw = get_llm_response(
        system_prompt=ACTION_ITEMS_PROMPT,
        user_prompt=combined,
        max_tokens=700,
        temperature=0.1,
        require_json=True,
    )

    if not raw:
        return _default_actions()

    try:
        parsed = json.loads(raw)
        valid_owners = {"Agent", "Team Lead", "Technical Team", "Customer", "Management"}
        valid_priorities = {"High", "Medium", "Low"}
        valid_categories = {"Follow-up", "Resolution", "Escalation", "Documentation", "Training", "Compensation"}

        items = []
        for item in parsed.get("action_items", []):
            owner = item.get("owner", "Agent")
            if owner not in valid_owners:
                owner = "Agent"
            priority = item.get("priority", "Medium")
            if priority not in valid_priorities:
                priority = "Medium"
            category = item.get("category", "Follow-up")
            if category not in valid_categories:
                category = "Follow-up"
            items.append({
                "action": str(item.get("action", ""))[:200],
                "owner": owner,
                "priority": priority,
                "deadline": str(item.get("deadline", "Within 1 week"))[:50],
                "category": category,
            })

        return {
            "action_items": items[:10],
            "summary": str(parsed.get("summary", ""))[:300],
            "escalation_required": bool(parsed.get("escalation_required", False)),
        }
    except (json.JSONDecodeError, Exception) as e:
        logger.warning("action_items_parse_failed", error=str(e))
        return _default_actions()


def _default_actions() -> dict:
    return {
        "action_items": [],
        "summary": "No action items identified.",
        "escalation_required": False,
    }
