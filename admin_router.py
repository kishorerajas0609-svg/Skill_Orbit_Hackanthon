from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from database import (
    get_users_col,
    get_recruiter_profiles_col,
    get_institution_profiles_col,
    get_student_profiles_col,
    get_opportunities_col,
    get_applications_col,
    get_audit_logs_col,
    get_notifications_col
)
from auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/admin", tags=["Platform Administration"])

class VerifyRecruiterRequest(BaseModel):
    recruiter_user_id: str
    status: str # verified, rejected
    reason: Optional[str] = ""

class UpdateUserStatusRequest(BaseModel):
    user_id: str
    status: str # active, suspended

@router.get("/dashboard")
async def get_admin_dashboard(current_user: dict = Depends(require_roles(["admin"]))):
    users_col = get_users_col()
    opps_col = get_opportunities_col()
    apps_col = get_applications_col()
    recruiter_col = get_recruiter_profiles_col()
    audit_col = get_audit_logs_col()

    # User counts by role
    students_count = await users_col.count_documents({"role": "student"})
    recruiters_count = await users_col.count_documents({"role": "recruiter"})
    institutions_count = await users_col.count_documents({"role": "institution"})
    academicians_count = await users_col.count_documents({"role": "academician"})
    total_users = students_count + recruiters_count + institutions_count + academicians_count

    # Verification requests
    pending_verifications = await recruiter_col.find({"verification_status": "pending_verification"}).to_list(20)
    
    # Opportunities & apps
    total_opps = await opps_col.count_documents()
    total_apps = await apps_col.count_documents()

    # Recent audits
    recent_audits = await audit_col.find().sort("timestamp", -1).limit(10).to_list()

    return {
        "metrics": {
            "total_users": total_users,
            "students": students_count,
            "recruiters": recruiters_count,
            "institutions": institutions_count,
            "academicians": academicians_count,
            "total_opportunities": total_opps,
            "total_applications": total_apps,
            "pending_recruiter_verifications": len(pending_verifications)
        },
        "pending_verifications": pending_verifications,
        "recent_audits": recent_audits
    }

@router.get("/users")
async def list_users(role: Optional[str] = None, current_user: dict = Depends(require_roles(["admin"]))):
    users_col = get_users_col()
    q = {}
    if role:
        q["role"] = role
    users = await users_col.find(q).sort("created_at", -1).to_list(100)
    # Remove password hashes from response
    for u in users:
        u.pop("password_hash", None)
    return {"users": users}

@router.post("/verify-recruiter")
async def verify_recruiter(req: VerifyRecruiterRequest, current_user: dict = Depends(require_roles(["admin"]))):
    recruiter_col = get_recruiter_profiles_col()
    users_col = get_users_col()
    notif_col = get_notifications_col()
    audit_col = get_audit_logs_col()

    now = datetime.now(timezone.utc).isoformat()
    status_val = "verified" if req.status == "verified" else "rejected"

    await recruiter_col.update_one(
        {"user_id": req.recruiter_user_id},
        {"$set": {"verification_status": status_val, "verified_at": now, "verification_reason": req.reason}}
    )
    
    if status_val == "verified":
        await users_col.update_one(
            {"_id": req.recruiter_user_id},
            {"$set": {"is_verified": True}}
        )

    # Notify recruiter
    await notif_col.insert_one({
        "user_id": req.recruiter_user_id,
        "title": f"Company Verification {status_val.title()}",
        "message": f"Your recruiter account has been {status_val} by platform administration." + (f" Note: {req.reason}" if req.reason else ""),
        "type": "verification",
        "read": False,
        "created_at": now
    })

    # Audit log
    await audit_col.insert_one({
        "admin_id": current_user["_id"],
        "target_user_id": req.recruiter_user_id,
        "action": f"RECRUITER_VERIFICATION_{status_val.upper()}",
        "timestamp": now
    })

    return {"message": f"Recruiter status updated to {status_val}"}

@router.post("/user-status")
async def update_user_status(req: UpdateUserStatusRequest, current_user: dict = Depends(require_roles(["admin"]))):
    users_col = get_users_col()
    await users_col.update_one(
        {"_id": req.user_id},
        {"$set": {"status": req.status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": f"User status set to {req.status}"}
