from typing import List, Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from database import get_users_col
from auth.security import decode_token

security = HTTPBearer(auto_error=False)

async def get_token_from_request(
    request: Request,
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[str]:
    # Check Authorization header first
    if auth_header and auth_header.credentials:
        return auth_header.credentials
    # Check cookie fallback
    token = request.cookies.get("access_token")
    return token

async def get_current_user(
    request: Request,
    token: Optional[str] = Depends(get_token_from_request)
) -> dict:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_token(token, is_refresh=False)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    users_col = get_users_col()
    user = await users_col.find_one({"_id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or has been deactivated.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.get("status") == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended. Please contact platform support.",
        )
    
    return user

async def get_optional_user(
    request: Request,
    token: Optional[str] = Depends(get_token_from_request)
) -> Optional[dict]:
    if not token:
        return None
    try:
        payload = decode_token(token, is_refresh=False)
        user_id = payload.get("sub")
        if not user_id:
            return None
        users_col = get_users_col()
        user = await users_col.find_one({"_id": user_id})
        return user
    except Exception:
        return None

def require_roles(allowed_roles: List[str]):
    async def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        user_role = current_user.get("role")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of the following roles: {', '.join(allowed_roles)}. Current role: {user_role}",
            )
        return current_user
    return role_checker
