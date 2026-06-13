import json
from app.core.logging import get_logger
from app.services.llm_client import get_llm_response

logger = get_logger(__name__)

UPSELL_PROMPT = """You are a revenue optimization expert specializing in upsell and cross-sell identification.

Analyze this call transcript for upsell and cross-sell opportunities.

For each opportunity identify:
- product_service: name or description of the potential upsell/cross-sell
- trigger: what in the conversation triggered this opportunity (customer statement or context)
- potential_value: "Low", "Medium", or "High" revenue potential
- was_attempted: true if agent tried to upsell, false if missed
- recommendation: specific pitch or approach to offer this product

Respond ONLY with valid JSON:
{
  "opportunities": [
    {
      "product_service": "Premium Support Plan",
      "trigger": "Customer complained about slow response times",
      "potential_value": "High",
      "was_attempted": false,
      "recommendation": "Offer 24/7 priority support plan at discounted rate"
    }
  ],
  "total_opportunities": 2,
  "missed_opportunities": 1,
  "revenue_potential": "Medium",
  "upsell_summary": "Agent missed 1 high-value upsell opportunity during billing discussion"
}"""


def detect_upsell_opportunities(transcript: str, summary: str) -> dict:
    if not transcript:
        return _default_upsell()

    combined = f"Transcript:\n{transcript}\n\nSummary:\n{summary}"
    raw = get_llm_response(
        system_prompt=UPSELL_PROMPT,
        user_prompt=combined,
        max_tokens=700,
        temperature=0.2,
        require_json=True,
    )

    if not raw:
        return _default_upsell()

    try:
        parsed = json.loads(raw)
        opportunities = []
        for opp in parsed.get("opportunities", []):
            val = opp.get("potential_value", "Medium")
            if val not in ("Low", "Medium", "High"):
                val = "Medium"
            opportunities.append({
                "product_service": str(opp.get("product_service", ""))[:100],
                "trigger": str(opp.get("trigger", ""))[:200],
                "potential_value": val,
                "was_attempted": bool(opp.get("was_attempted", False)),
                "recommendation": str(opp.get("recommendation", ""))[:250],
            })

        revenue = parsed.get("revenue_potential", "Medium")
        if revenue not in ("Low", "Medium", "High"):
            revenue = "Medium"

        return {
            "opportunities": opportunities[:6],
            "total_opportunities": int(parsed.get("total_opportunities", len(opportunities))),
            "missed_opportunities": int(parsed.get("missed_opportunities", 0)),
            "revenue_potential": revenue,
            "upsell_summary": str(parsed.get("upsell_summary", ""))[:300],
        }
    except (json.JSONDecodeError, Exception) as e:
        logger.warning("upsell_parse_failed", error=str(e))
        return _default_upsell()


def _default_upsell() -> dict:
    return {
        "opportunities": [],
        "total_opportunities": 0,
        "missed_opportunities": 0,
        "revenue_potential": "Low",
        "upsell_summary": "No upsell opportunities identified.",
    }
