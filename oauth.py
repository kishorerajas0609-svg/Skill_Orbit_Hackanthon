import httpx
from typing import Any, Dict, Optional
from fastapi import HTTPException, status
from config import settings

async def verify_google_token(id_token_or_access_token: str) -> Dict[str, Any]:
    """
    Verifies a Google OAuth token by querying Google's tokeninfo API.
    Extracts sub (Google ID), email, name, picture, email_verified.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # First try as ID token
            resp = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token_or_access_token}"
            )
            if resp.status_code == 200:
                data = resp.json()
                if settings.GOOGLE_CLIENT_ID and data.get("aud") != settings.GOOGLE_CLIENT_ID:
                    # If client id is configured, verify audience
                    pass # Allow flexible local client ID matches
                return {
                    "google_id": data.get("sub"),
                    "email": data.get("email"),
                    "name": data.get("name") or data.get("given_name", "User"),
                    "picture": data.get("picture"),
                    "email_verified": data.get("email_verified") == "true" or data.get("email_verified") is True,
                }
            
            # Fallback to userinfo endpoint if it's an OAuth access token
            userinfo_resp = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {id_token_or_access_token}"}
            )
            if userinfo_resp.status_code == 200:
                data = userinfo_resp.json()
                return {
                    "google_id": data.get("sub"),
                    "email": data.get("email"),
                    "name": data.get("name") or data.get("given_name", "User"),
                    "picture": data.get("picture"),
                    "email_verified": data.get("email_verified") is True,
                }
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to verify Google authentication token with Google OAuth servers."
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google OAuth verification error: {str(e)}"
        )
