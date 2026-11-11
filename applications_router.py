import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from database import (
    get_applications_col,
    get_opportunities_col,
    get_student_profiles_col,
    get_notifications_col
)
from auth.dependencies import get_current_user, require_roles
from services.matching_engine import calculate_student_job_match

router = APIRouter(prefix="/applications", tags=["Application Tracking"])

class SubmitApplicationRequest(BaseModel):
    opportunity_id: str
    cover_note: Optional[str] = ""
    resume_url: Optional[str] = ""

class UpdateApplicationStatusRequest(BaseModel):
    status: str # Applied, Under Review, Shortlisted, Assessment, Interview, Selected, Rejected, Offer Accepted, Offer Declined
    feedback: Optional[str] = ""

@router.post("")
async def apply_to_opportunity(req: SubmitApplicationRequest, current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    opp_col = get_opportunities_col()
    apps_col = get_applications_col()
    notif_col = get_notifications_col()

    opp = await opp_col.find_one({"_id": req.opportunity_id})
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    if opp.get("status") != "active":
        raise HTTPException(status_code=400, detail="This opportunity is no longer accepting applications.")

    # Check existing application
    existing = await apps_col.find_one({"opportunity_id": req.opportunity_id, "applicant_id": user_id})
    if existing:
        if existing.get("status") == "Withdrawn":
            # Allow re-applying if previously withdrawn
            now = datetime.now(timezone.utc).isoformat()
            await apps_col.update_one(
                {"_id": existing["_id"]},
                {"$set": {"status": "Applied", "cover_note": req.cover_note, "applied_at": now}}
            )
            return {"message": "Application resubmitted successfully"}
        raise HTTPException(status_code=400, detail="You have already applied for this opportunity.")

    student_profile = await get_student_profiles_col().find_one({"user_id": user_id}) or {}
    match_data = calculate_student_job_match(student_profile, opp)

    now = datetime.now(timezone.utc).isoformat()
    app_id = str(uuid.uuid4())

    application_doc = {
        "_id": app_id,
        "opportunity_id": req.opportunity_id,
        "opportunity_title": opp.get("title"),
        "company_name": opp.get("company_name"),
        "company_logo_url": opp.get("company_logo_url", ""),
        "opportunity_type": opp.get("type"),
        "recruiter_id": opp.get("creator_id"),
        "applicant_id": user_id,
        "applicant_name": current_user.get("full_name"),
        "applicant_email": current_user.get("email"),
        "applicant_avatar": current_user.get("avatar_url", ""),
        "cover_note": req.cover_note,
        "resume_url": req.resume_url,
        "match_score_at_apply": match_data["overall_match"],
        "match_breakdown": match_data,
        "status": "Applied",
        "timeline": [
            {
                "status": "Applied",
                "timestamp": now,
                "note": "Application submitted by candidate"
            }
        ],
        "applied_at": now,
        "updated_at": now
    }

    await apps_col.insert_one(application_doc)
    await opp_col.update_one({"_id": req.opportunity_id}, {"$inc": {"applicants_count": 1}})

    # Notify recruiter
    if opp.get("creator_id"):
        await notif_col.insert_one({
            "user_id": opp["creator_id"],
            "title": f"New Application: {opp.get('title')}",
            "message": f"{current_user.get('full_name')} applied with a {match_data['overall_match']}% match score.",
            "type": "application",
            "action_url": f"/recruiter/applications",
            "read": False,
            "created_at": now
        })

    return {"message": "Application submitted successfully", "application": application_doc}

@router.get("/my-applications")
async def get_student_applications(current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    apps_col = get_applications_col()
    applications = await apps_col.find({"applicant_id": user_id}).sort("applied_at", -1).to_list(100)
    return {"applications": applications}

@router.get("/opportunity/{opp_id}")
async def get_opportunity_applications(opp_id: str, current_user: dict = Depends(require_roles(["recruiter", "admin"]))):
    opp_col = get_opportunities_col()
    apps_col = get_applications_col()
    student_col = get_student_profiles_col()

    opp = await opp_col.find_one({"_id": opp_id})
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    if current_user["role"] != "admin" and opp.get("creator_id") != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view applications for this listing")

    apps = await apps_col.find({"opportunity_id": opp_id}).sort("applied_at", -1).to_list(200)

    # Attach live student profile skills & projects for recruiter review
    enriched_apps = []
    for app in apps:
        stu = await student_col.find_one({"user_id": app.get("applicant_id")}) or {}
        app_copy = dict(app)
        app_copy["student_profile"] = {
            "academic": stu.get("academic", {}),
            "skills": stu.get("skills", []),
            "projects": stu.get("projects", []),
            "bio": stu.get("bio", ""),
            "linkedin_url": stu.get("linkedin_url", ""),
            "github_url": stu.get("github_url", "")
        }
        enriched_apps.append(app_copy)

    return {"applications": enriched_apps, "opportunity": opp}

@router.put("/{app_id}/status")
async def update_application_status(app_id: str, req: UpdateApplicationStatusRequest, current_user: dict = Depends(require_roles(["recruiter", "admin"]))):
    apps_col = get_applications_col()
    opp_col = get_opportunities_col()
    notif_col = get_notifications_col()

    app = await apps_col.find_one({"_id": app_id})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    now = datetime.now(timezone.utc).isoformat()
    new_timeline_entry = {
        "status": req.status,
        "timestamp": now,
        "note": req.feedback or f"Status updated to {req.status}"
    }

    await apps_col.update_one(
        {"_id": app_id},
        {
            "$set": {"status": req.status, "updated_at": now},
            "$push": {"timeline": new_timeline_entry}
        }
    )

    # Send notification to student applicant
    await notif_col.insert_one({
        "user_id": app["applicant_id"],
        "title": f"Application Status: {req.status}",
        "message": f"Your application for '{app.get('opportunity_title')}' at {app.get('company_name')} is now '{req.status}'.",
        "type": "status_change",
        "action_url": "/student/applications",
        "read": False,
        "created_at": now
    })

    return {"message": f"Application status updated to {req.status}"}

@router.post("/{app_id}/withdraw")
async def withdraw_application(app_id: str, current_user: dict = Depends(require_roles(["student"]))):
    apps_col = get_applications_col()
    app = await apps_col.find_one({"_id": app_id, "applicant_id": current_user["_id"]})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    now = datetime.now(timezone.utc).isoformat()
    await apps_col.update_one(
        {"_id": app_id},
        {
            "$set": {"status": "Withdrawn", "updated_at": now},
            "$push": {
                "timeline": {
                    "status": "Withdrawn",
                    "timestamp": now,
                    "note": "Application withdrawn by student"
                }
            }
        }
    )

    return {"message": "Application withdrawn successfully"}
