import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, HttpUrl
from database import (
    get_users_col,
    get_recruiter_profiles_col,
    get_opportunities_col,
    get_applications_col,
    get_student_profiles_col
)
from auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/recruiters", tags=["Recruiter Portal"])

class RecruiterOnboardingRequest(BaseModel):
    company_name: str
    company_website: Optional[str] = ""
    company_logo_url: Optional[str] = ""
    industry: Optional[str] = "Technology"
    company_size: Optional[str] = "51-200"
    headquarters: Optional[str] = ""
    cin_or_reg_number: Optional[str] = ""
    description: Optional[str] = ""
    position_title: Optional[str] = "Talent Acquisition"
    department: Optional[str] = "HR / Engineering"
    hiring_roles: Optional[List[str]] = []
    preferred_streams: Optional[List[str]] = []

class UpdateRecruiterProfileRequest(BaseModel):
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    company_logo_url: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    headquarters: Optional[str] = None
    cin_or_reg_number: Optional[str] = None
    description: Optional[str] = None
    position_title: Optional[str] = None
    department: Optional[str] = None
    hiring_roles: Optional[List[str]] = None
    preferred_streams: Optional[List[str]] = None

class CandidateSearchQuery(BaseModel):
    skill: Optional[str] = None
    min_proficiency: Optional[float] = 0
    verified_only: Optional[bool] = False
    department: Optional[str] = None
    min_cgpa: Optional[float] = 0
    graduation_year: Optional[int] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None

@router.post("/onboarding")
async def recruiter_onboarding(req: RecruiterOnboardingRequest, current_user: dict = Depends(require_roles(["recruiter"]))):
    user_id = current_user["_id"]
    now = datetime.now(timezone.utc).isoformat()
    
    recruiter_col = get_recruiter_profiles_col()
    users_col = get_users_col()

    profile_data = {
        "user_id": user_id,
        "full_name": current_user.get("full_name", ""),
        "email": current_user.get("email", ""),
        "company_name": req.company_name,
        "company_website": req.company_website,
        "company_logo_url": req.company_logo_url,
        "industry": req.industry,
        "company_size": req.company_size,
        "headquarters": req.headquarters,
        "cin_or_reg_number": req.cin_or_reg_number,
        "description": req.description,
        "position_title": req.position_title,
        "department": req.department,
        "hiring_roles": req.hiring_roles or [],
        "preferred_streams": req.preferred_streams or [],
        "verification_status": "pending_verification",
        "is_completed": True,
        "updated_at": now
    }

    existing = await recruiter_col.find_one({"user_id": user_id})
    if existing:
        await recruiter_col.update_one({"user_id": user_id}, {"$set": profile_data})
    else:
        profile_data["_id"] = str(uuid.uuid4())
        profile_data["created_at"] = now
        await recruiter_col.insert_one(profile_data)

    await users_col.update_one({"_id": user_id}, {"$set": {"is_onboarded": True}})
    return {"message": "Recruiter profile created and submitted for verification", "profile": profile_data}

@router.get("/profile")
async def get_recruiter_profile(current_user: dict = Depends(require_roles(["recruiter"]))):
    user_id = current_user["_id"]
    recruiter_col = get_recruiter_profiles_col()
    profile = await recruiter_col.find_one({"user_id": user_id})
    if not profile:
        profile = {
            "user_id": user_id,
            "full_name": current_user.get("full_name"),
            "email": current_user.get("email"),
            "verification_status": "unverified"
        }
    profile["avatar_url"] = current_user.get("avatar_url", "")
    return {"profile": profile}

@router.put("/profile")
async def update_recruiter_profile(req: UpdateRecruiterProfileRequest, current_user: dict = Depends(require_roles(["recruiter"]))):
    user_id = current_user["_id"]
    recruiter_col = get_recruiter_profiles_col()
    users_col = get_users_col()

    update_data = {k: v for k, v in req.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    if req.full_name:
        await users_col.update_one({"_id": user_id}, {"$set": {"full_name": req.full_name}})

    await recruiter_col.update_one({"user_id": user_id}, {"$set": update_data})
    return {"message": "Recruiter profile updated successfully"}

@router.get("/dashboard")
async def get_recruiter_dashboard(current_user: dict = Depends(require_roles(["recruiter"]))):
    user_id = current_user["_id"]
    opps_col = get_opportunities_col()
    apps_col = get_applications_col()
    recruiter_col = get_recruiter_profiles_col()

    profile = await recruiter_col.find_one({"user_id": user_id}) or {}

    # Get opportunities posted by this recruiter
    my_opps = await opps_col.find({"creator_id": user_id}).to_list()
    opp_ids = [opp["_id"] for opp in my_opps]

    # Application metrics across recruiter's listings
    total_apps = 0
    shortlisted_count = 0
    interviews_count = 0
    offers_count = 0
    under_review_count = 0

    if opp_ids:
        total_apps = await apps_col.count_documents({"opportunity_id": {"$in": opp_ids}})
        under_review_count = await apps_col.count_documents({"opportunity_id": {"$in": opp_ids}, "status": "Under Review"})
        shortlisted_count = await apps_col.count_documents({"opportunity_id": {"$in": opp_ids}, "status": "Shortlisted"})
        interviews_count = await apps_col.count_documents({"opportunity_id": {"$in": opp_ids}, "status": "Interview"})
        offers_count = await apps_col.count_documents({"opportunity_id": {"$in": opp_ids}, "status": {"$in": ["Selected", "Offer Accepted"]}})

    # Recent applicants
    recent_apps = []
    if opp_ids:
        recent_apps = await apps_col.find({"opportunity_id": {"$in": opp_ids}}).sort("applied_at", -1).limit(5).to_list()

    return {
        "profile": profile,
        "stats": {
            "active_opportunities": len([o for o in my_opps if o.get("status") == "active"]),
            "total_opportunities": len(my_opps),
            "total_applications": total_apps,
            "under_review": under_review_count,
            "shortlisted": shortlisted_count,
            "interviews_scheduled": interviews_count,
            "offers_extended": offers_count
        },
        "opportunities": my_opps[:6],
        "recent_applications": recent_apps
    }

@router.post("/candidate-search")
async def search_candidates(query: CandidateSearchQuery, current_user: dict = Depends(require_roles(["recruiter", "institution", "admin"]))):
    student_col = get_student_profiles_col()
    
    # Query only public student profiles
    filter_q = {"visibility.recruiter_view": True}
    if query.department:
        filter_q["academic.department"] = {"$regex": query.department, "$options": "i"}
    if query.graduation_year:
        filter_q["academic.graduation_year"] = query.graduation_year
    if query.min_cgpa and query.min_cgpa > 0:
        filter_q["academic.cgpa"] = {"$gte": query.min_cgpa}
    if query.location:
        filter_q["location"] = {"$regex": query.location, "$options": "i"}

    candidates = await student_col.find(filter_q).to_list(100)

    # Filter by skills & verified criteria in memory
    results = []
    target_skill = query.skill.strip().lower() if query.skill else None
    
    for cand in candidates:
        skills = cand.get("skills", [])
        verified_skills = [s for s in skills if s.get("verified")]
        
        match = True
        skill_match_info = None

        if target_skill:
            matched = False
            for s in skills:
                if target_skill in s.get("name", "").lower():
                    prof = float(s.get("proficiency", 0))
                    if prof >= (query.min_proficiency or 0):
                        if not query.verified_only or s.get("verified"):
                            matched = True
                            skill_match_info = s
                            break
            if not matched:
                match = False

        if match:
            # Mask private email/phone unless permission allows
            results.append({
                "student_id": cand.get("user_id"),
                "full_name": cand.get("full_name"),
                "avatar_url": cand.get("avatar_url", ""),
                "bio": cand.get("bio", ""),
                "location": cand.get("location", ""),
                "academic": cand.get("academic", {}),
                "skills": skills,
                "verified_skills_count": len(verified_skills),
                "matched_skill": skill_match_info,
                "projects_count": len(cand.get("projects", [])),
                "linkedin_url": cand.get("linkedin_url", ""),
                "github_url": cand.get("github_url", "")
            })

    return {"candidates": results, "total_found": len(results)}
