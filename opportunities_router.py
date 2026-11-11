import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from database import (
    get_opportunities_col,
    get_recruiter_profiles_col,
    get_student_profiles_col,
    get_applications_col
)
from auth.dependencies import get_current_user, get_optional_user, require_roles
from services.matching_engine import calculate_student_job_match

router = APIRouter(prefix="/opportunities", tags=["Opportunities & Jobs"])

class OpportunityCreateRequest(BaseModel):
    title: str
    type: str # internship, full_time, contract, apprenticeship
    company_name: str
    company_logo_url: Optional[str] = ""
    description: str
    responsibilities: Optional[List[str]] = []
    required_skills: List[Dict[str, Any]] # [{"name": "React", "min_proficiency": 70}]
    preferred_skills: Optional[List[Dict[str, Any]]] = []
    eligible_departments: Optional[List[str]] = []
    eligible_degrees: Optional[List[str]] = []
    eligible_graduation_years: Optional[List[int]] = []
    min_cgpa: Optional[float] = 0.0
    openings: int = 1
    location: str
    work_mode: str # onsite, remote, hybrid
    duration_months: Optional[int] = 3
    stipend_or_salary: str
    application_deadline: str
    joining_date: Optional[str] = ""
    selection_stages: Optional[List[str]] = ["Resume Screening", "Skill Assessment", "Technical Interview", "HR Discussion"]
    benefits: Optional[List[str]] = []

class OpportunityUpdateRequest(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    responsibilities: Optional[List[str]] = None
    required_skills: Optional[List[Dict[str, Any]]] = None
    preferred_skills: Optional[List[Dict[str, Any]]] = None
    eligible_departments: Optional[List[str]] = None
    eligible_degrees: Optional[List[str]] = None
    eligible_graduation_years: Optional[List[int]] = None
    min_cgpa: Optional[float] = None
    openings: Optional[int] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    duration_months: Optional[int] = None
    stipend_or_salary: Optional[str] = None
    application_deadline: Optional[str] = None
    status: Optional[str] = None # active, closed

@router.post("")
async def create_opportunity(req: OpportunityCreateRequest, current_user: dict = Depends(require_roles(["recruiter", "admin"]))):
    opp_col = get_opportunities_col()
    recruiter_col = get_recruiter_profiles_col()
    now = datetime.now(timezone.utc).isoformat()

    # Retrieve recruiter company details if available
    recruiter_profile = await recruiter_col.find_one({"user_id": current_user["_id"]}) or {}
    company_name = req.company_name or recruiter_profile.get("company_name", current_user.get("full_name"))
    company_logo = req.company_logo_url or recruiter_profile.get("company_logo_url", "")

    opp_doc = {
        "_id": str(uuid.uuid4()),
        "creator_id": current_user["_id"],
        "title": req.title,
        "type": req.type,
        "company_name": company_name,
        "company_logo_url": company_logo,
        "description": req.description,
        "responsibilities": req.responsibilities or [],
        "required_skills": req.required_skills,
        "preferred_skills": req.preferred_skills or [],
        "eligible_departments": req.eligible_departments or [],
        "eligible_degrees": req.eligible_degrees or [],
        "eligible_graduation_years": req.eligible_graduation_years or [],
        "min_cgpa": req.min_cgpa or 0.0,
        "openings": req.openings,
        "location": req.location,
        "work_mode": req.work_mode,
        "duration_months": req.duration_months,
        "stipend_or_salary": req.stipend_or_salary,
        "application_deadline": req.application_deadline,
        "joining_date": req.joining_date,
        "selection_stages": req.selection_stages or ["Screening", "Assessment", "Interview"],
        "benefits": req.benefits or [],
        "status": "active",
        "applicants_count": 0,
        "created_at": now,
        "updated_at": now
    }

    await opp_col.insert_one(opp_doc)
    return {"message": "Opportunity published successfully", "opportunity": opp_doc}

@router.get("/search")
async def search_opportunities(
    query: Optional[str] = None,
    type: Optional[str] = None,
    work_mode: Optional[str] = None,
    location: Optional[str] = None,
    skill: Optional[str] = None,
    min_match: Optional[float] = None,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    opp_col = get_opportunities_col()
    
    find_q = {"status": "active"}
    if type and type != "all":
        find_q["type"] = type
    if work_mode and work_mode != "all":
        find_q["work_mode"] = work_mode
    if location:
        find_q["location"] = {"$regex": location, "$options": "i"}

    opps = await opp_col.find(find_q).sort("created_at", -1).to_list(100)

    # If student is logged in, calculate real deterministic matching scores
    student_profile = None
    if current_user and current_user.get("role") == "student":
        student_profile = await get_student_profiles_col().find_one({"user_id": current_user["_id"]})

    results = []
    for opp in opps:
        # Match text query across title, company, description, or required skills
        if query:
            q_lower = query.lower()
            t_match = q_lower in opp.get("title", "").lower()
            c_match = q_lower in opp.get("company_name", "").lower()
            d_match = q_lower in opp.get("description", "").lower()
            s_match = any(q_lower in str(s.get("name", "")).lower() for s in opp.get("required_skills", []))
            if not (t_match or c_match or d_match or s_match):
                continue

        # Match specific skill filter
        if skill:
            s_lower = skill.lower()
            if not any(s_lower in str(s.get("name", "")).lower() for s in opp.get("required_skills", [])):
                continue

        match_data = None
        if student_profile:
            match_data = calculate_student_job_match(student_profile, opp)
            opp["match_score"] = match_data["overall_match"]
            opp["match_breakdown"] = match_data

        if min_match is not None and match_data:
            if match_data["overall_match"] < min_match:
                continue

        results.append(opp)

    # If student has match scores, sort by match_score descending by default
    if student_profile:
        results.sort(key=lambda x: x.get("match_score", 0), reverse=True)

    return {"opportunities": results, "total": len(results)}

@router.get("/{opp_id}")
async def get_opportunity_details(opp_id: str, current_user: Optional[dict] = Depends(get_optional_user)):
    opp_col = get_opportunities_col()
    opp = await opp_col.find_one({"_id": opp_id})
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Match score if student
    has_applied = False
    if current_user and current_user.get("role") == "student":
        student_profile = await get_student_profiles_col().find_one({"user_id": current_user["_id"]})
        if student_profile:
            match_data = calculate_student_job_match(student_profile, opp)
            opp["match_score"] = match_data["overall_match"]
            opp["match_breakdown"] = match_data

        # Check existing application
        existing_app = await get_applications_col().find_one({"opportunity_id": opp_id, "applicant_id": current_user["_id"]})
        if existing_app:
            has_applied = True
            opp["application_status"] = existing_app.get("status")

    opp["has_applied"] = has_applied
    return {"opportunity": opp}

@router.put("/{opp_id}")
async def update_opportunity(opp_id: str, req: OpportunityUpdateRequest, current_user: dict = Depends(require_roles(["recruiter", "admin"]))):
    opp_col = get_opportunities_col()
    opp = await opp_col.find_one({"_id": opp_id})
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    if current_user["role"] != "admin" and opp.get("creator_id") != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to edit this opportunity")

    update_data = {k: v for k, v in req.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    await opp_col.update_one({"_id": opp_id}, {"$set": update_data})
    return {"message": "Opportunity updated"}

@router.delete("/{opp_id}")
async def delete_opportunity(opp_id: str, current_user: dict = Depends(require_roles(["recruiter", "admin"]))):
    opp_col = get_opportunities_col()
    opp = await opp_col.find_one({"_id": opp_id})
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    if current_user["role"] != "admin" and opp.get("creator_id") != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this opportunity")

    await opp_col.delete_one({"_id": opp_id})
    return {"message": "Opportunity removed"}
