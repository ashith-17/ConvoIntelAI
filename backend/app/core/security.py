import os
from fastapi import Header, HTTPException


async def validate_api_key(x_api_key: str = Header(...)):
    expected = os.environ.get("API_KEY", "sk_intel_987654321")
    if x_api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key
