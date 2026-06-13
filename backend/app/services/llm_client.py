import os
from app.core.logging import get_logger

logger = get_logger(__name__)


def get_llm_response(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 800,
    temperature: float = 0.0,
    require_json: bool = False,
) -> str:
    """Groq → OpenAI → empty string fallback chain."""

    groq_key = os.environ.get("GROQ_API_KEY", "").strip()
    if groq_key and len(groq_key) > 10:
        try:
            from groq import Groq
            client = Groq(api_key=groq_key)
            sys_prompt = system_prompt
            if require_json:
                sys_prompt += "\n\nCRITICAL: Return ONLY valid JSON. No markdown, no backticks, no extra text."
            resp = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": sys_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=max_tokens,
                temperature=temperature,
            )
            text = resp.choices[0].message.content.strip()
            # Strip markdown code fences if model ignores instructions
            if text.startswith("```"):
                parts = text.split("```")
                text = parts[1] if len(parts) > 1 else text
                if text.startswith("json"):
                    text = text[4:]
                text = text.strip()
            logger.info("llm_provider", provider="groq", chars=len(text))
            return text
        except Exception as exc:
            logger.warning("groq_llm_failed", error=str(exc))

    openai_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if openai_key and openai_key.startswith("sk-"):
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key)
            kwargs = dict(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=max_tokens,
                temperature=temperature,
            )
            if require_json:
                kwargs["response_format"] = {"type": "json_object"}
            resp = client.chat.completions.create(**kwargs)
            text = resp.choices[0].message.content.strip()
            logger.info("llm_provider", provider="openai", chars=len(text))
            return text
        except Exception as exc:
            logger.warning("openai_llm_failed", error=str(exc))

    logger.error("all_llm_failed")
    return ""
