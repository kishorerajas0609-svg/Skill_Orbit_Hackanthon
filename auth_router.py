import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from pydantic import BaseModel, EmailStr
from config import settings
from database import (
    get_users_col,
    get_student_profiles_col,
    get_recruiter_profiles_col,
    get_institution_profiles_col,
    get_academician_profiles_col,
    get_audit_logs_col
)
from auth.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    validate_password_strength
)
from auth.oauth import verify_google_token
from auth.dependencies import get_current_user
from services.email_service import email_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str  # student, recruiter, institution, academician

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    credential_or_token: str
    role_if_new: Optional[str] = "student"

class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    current_password: Optional[str] = None
    new_password: str

class UpdateThemeRequest(BaseModel):
    theme: str  # dark, light, system

@router.post("/register")
async def register(req: RegisterRequest, response: Response):
    role = req.role.strip().lower()
    if role not in ["student", "recruiter", "institution", "academician"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'student', 'recruiter', 'institution', or 'academician'."
        )
        
    users_col = get_users_col()
    existing = await users_col.find_one({"email": req.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in."
        )

    # Validate and hash password
    hashed_pwd = hash_password(req.password)
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    new_user = {
        "_id": user_id,
        "email": req.email.lower(),
        "password_hash": hashed_pwd,
        "full_name": req.full_name.strip(),
        "role": role,
        "avatar_url": "",
        "is_verified": False,
        "is_onboarded": False,
        "theme": "dark",
        "created_at": now,
        "updated_at": now,
        "status": "active",
        "auth_provider": "local"
    }

    await users_col.insert_one(new_user)

    # Create initial blank profile based on role
    if role == "student":
        await get_student_profiles_col().insert_one({
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "full_name": req.full_name.strip(),
            "email": req.email.lower(),
            "academic": {},
            "skills": [],
            "projects": [],
            "experience": [],
            "certificates": [],
            "career_target": {},
            "career_preferences": {},
            "visibility": {"profile": "public", "recruiter_view": True},
            "created_at": now
        })
    elif role == "recruiter":
        await get_recruiter_profiles_col().insert_one({
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "full_name": req.full_name.strip(),
            "email": req.email.lower(),
            "company_name": "",
            "verification_status": "unverified",
            "hiring_preferences": {},
            "created_at": now
        })
    elif role == "institution":
        await get_institution_profiles_col().insert_one({
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "institution_name": req.full_name.strip(),
            "contact_email": req.email.lower(),
            "departments": [],
            "created_at": now
        })
    elif role == "academician":
        await get_academician_profiles_col().insert_one({
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "full_name": req.full_name.strip(),
            "email": req.email.lower(),
            "department": "",
            "designation": "",
            "publications": [],
            "created_at": now
        })

    # Generate tokens
    token_payload = {"sub": user_id, "role": role, "email": req.email.lower()}
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)

    # Set httpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=3600 * 24,
        samesite="lax",
        secure=False # set True in production HTTPS
    )

    # Log audit
    await get_audit_logs_col().insert_one({
        "user_id": user_id,
        "action": "USER_REGISTERED",
        "role": role,
        "timestamp": now
    })

    return {
        "message": "Account created successfully",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user_id,
            "_id": user_id,
            "email": req.email.lower(),
            "full_name": req.full_name,
            "role": role,
            "is_onboarded": False,
            "theme": "dark"
        }
    }

@router.post("/login")
async def login(req: LoginRequest, response: Response):
    users_col = get_users_col()
    user = await users_col.find_one({"email": req.email.lower()})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials."
        )

    if not user.get("password_hash"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account was created with Google Sign-In. Please click 'Continue with Google' or create a password in settings."
        )

    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials."
        )

    if user.get("status") == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is currently suspended. Please contact platform administration."
        )

    token_payload = {"sub": user["_id"], "role": user["role"], "email": user["email"]}
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=3600 * 24,
        samesite="lax",
        secure=False
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user["_id"],
            "email": user["email"],
            "full_name": user.get("full_name", ""),
            "role": user["role"],
            "avatar_url": user.get("avatar_url", ""),
            "is_onboarded": user.get("is_onboarded", False),
            "theme": user.get("theme", "dark")
        }
    }

@router.post("/google")
async def google_auth(req: GoogleAuthRequest, response: Response):
    google_data = await verify_google_token(req.credential_or_token)
    email = google_data["email"].lower()
    google_id = google_data["google_id"]
    name = google_data["name"]
    picture = google_data.get("picture", "")

    users_col = get_users_col()
    user = await users_col.find_one({"$or": [{"google_id": google_id}, {"email": email}]})
    now = datetime.now(timezone.utc).isoformat()

    if not user:
        # Create new user
        role = req.role_if_new if req.role_if_new in ["student", "recruiter", "institution", "academician"] else "student"
        user_id = str(uuid.uuid4())
        user = {
            "_id": user_id,
            "email": email,
            "password_hash": None,
            "full_name": name,
            "role": role,
            "avatar_url": picture,
            "google_id": google_id,
            "is_verified": True,
            "is_onboarded": False,
            "theme": "dark",
            "created_at": now,
            "updated_at": now,
            "status": "active",
            "auth_provider": "google"
        }
        await users_col.insert_one(user)

        # Initialize profile
        if role == "student":
            await get_student_profiles_col().insert_one({
                "_id": str(uuid.uuid4()),
                "user_id": user_id,
                "full_name": name,
                "email": email,
                "avatar_url": picture,
                "academic": {},
                "skills": [],
                "projects": [],
                "experience": [],
                "certificates": [],
                "visibility": {"profile": "public", "recruiter_view": True},
                "created_at": now
            })
    else:
        # Link google_id if not linked
        user_id = user["_id"]
        update_fields = {"updated_at": now}
        if not user.get("google_id"):
            update_fields["google_id"] = google_id
        if picture and not user.get("avatar_url"):
            update_fields["avatar_url"] = picture
        await users_col.update_one({"_id": user_id}, {"$set": update_fields})

    token_payload = {"sub": user_id, "role": user["role"], "email": email}
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=3600 * 24,
        samesite="lax",
        secure=False
    )

    return {
        "message": "Google authentication successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user_id,
            "email": email,
            "full_name": user.get("full_name", name),
            "role": user["role"],
            "avatar_url": user.get("avatar_url", picture),
            "is_onboarded": user.get("is_onboarded", False),
            "theme": user.get("theme", "dark")
        }
    }

@router.post("/refresh")
async def refresh_access_token(req: RefreshTokenRequest, response: Response):
    if not req.refresh_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Refresh token required")
    
    payload = decode_token(req.refresh_token, is_refresh=True)
    user_id = payload.get("sub")
    users_col = get_users_col()
    user = await users_col.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    token_payload = {"sub": user["_id"], "role": user["role"], "email": user["email"]}
    new_access = create_access_token(token_payload)

    response.set_cookie(
        key="access_token",
        value=new_access,
        httponly=True,
        max_age=3600 * 24,
        samesite="lax",
        secure=False
    )

    return {"access_token": new_access}

@router.post("/logout")
async def logout(response: Response, current_user: dict = Depends(get_current_user)):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}

@router.get("/me")
async def get_my_account(current_user: dict = Depends(get_current_user)):
    # Safe return without password_hash
    safe_user = dict(current_user)
    safe_user.pop("password_hash", None)
    safe_user["has_password"] = bool(current_user.get("password_hash"))
    return {"user": safe_user}

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    users_col = get_users_col()
    user = await users_col.find_one({"email": req.email.lower()})
    if not user:
        # Prevent email enumeration while returning clean response
        return {"message": "If an account with this email exists, a password reset link has been dispatched."}

    # Generate one-time reset token
    reset_token = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    await users_col.update_one(
        {"_id": user["_id"]},
        {"$set": {"reset_token": reset_token, "reset_token_created_at": now}}
    )

    reset_url = f"{settings.FRONTEND_URL}/reset-password"
    await email_service.send_password_reset_email(req.email.lower(), reset_token, reset_url)

    return {"message": "If an account with this email exists, a password reset link has been dispatched."}

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    validate_password_strength(req.new_password)
    users_col = get_users_col()
    user = await users_col.find_one({"email": req.email.lower(), "reset_token": req.token})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token."
        )

    new_hash = hash_password(req.new_password)
    await users_col.update_one(
        {"_id": user["_id"]},
        {"$set": {"password_hash": new_hash, "reset_token": None, "reset_token_created_at": None}}
    )

    return {"message": "Password reset successfully. You can now log in with your new password."}

@router.post("/change-password")
async def change_password(req: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    users_col = get_users_col()
    # If user has an existing password, verify current password
    if current_user.get("password_hash"):
        if not req.current_password or not verify_password(req.current_password, current_user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect."
            )

    validate_password_strength(req.new_password)
    new_hash = hash_password(req.new_password)
    await users_col.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"password_hash": new_hash, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )

    return {"message": "Password updated successfully."}

@router.post("/theme")
async def update_theme(req: UpdateThemeRequest, current_user: dict = Depends(get_current_user)):
    theme = req.theme if req.theme in ["dark", "light", "system"] else "dark"
    users_col = get_users_col()
    await users_col.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"theme": theme}}
    )
    return {"theme": theme}
