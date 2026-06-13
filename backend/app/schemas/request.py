from pydantic import BaseModel, field_validator


class CallAnalyticsRequest(BaseModel):
    language: str = "Auto-Detect"
    audioFormat: str = "mp3"
    audioBase64: str

    @field_validator("language")
    @classmethod
    def normalise_language(cls, v: str) -> str:
        v = v.strip()
        lower = v.lower()
        if lower in ("tamil", "ta", "tanglish"):
            return "Tamil"
        if lower in ("hindi", "hi", "hinglish"):
            return "Hindi"
        if lower in ("auto", "auto-detect", "auto_detect"):
            return "Auto-Detect"
        return v

    @field_validator("audioBase64")
    @classmethod
    def validate_base64_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) < 50:
            raise ValueError("audioBase64 must be a valid non-empty Base64 string.")
        return v
