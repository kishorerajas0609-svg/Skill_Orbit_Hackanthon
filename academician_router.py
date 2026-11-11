import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from database import (
    get_users_col,
    get_academician_profiles_col,
    get_faculty_programs_col,
    get_collaborations_col
)
from auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/academicians", tags=["Academician & Faculty Portal"])

class AcademicianOnboardingRequest(BaseModel):
    institution_name: str
    department: str
    designation: str
    qualifications: Optional[str] = ""
    highest_qualification: Optional[str] = None
    research_interests: Optional[List[str]] = []
    areas_of_expertise: Optional[List[str]] = None
    courses_taught: Optional[List[str]] = []
    industry_experience_years: Optional[int] = 0
    mentorship_available: Optional[bool] = True
    bio: Optional[str] = ""

class UpdateAcademicianProfileRequest(BaseModel):
    full_name: Optional[str] = None
    institution_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    qualifications: Optional[str] = None
    research_interests: Optional[List[str]] = None
    courses_taught: Optional[List[str]] = None
    industry_experience_years: Optional[int] = None
    mentorship_available: Optional[bool] = None
    bio: Optional[str] = None

class CreateFacultyProgramRequest(BaseModel):
    title: str
    type: str # FDP, Industrial Training, Guest Lecture, Research Collaboration, Consultancy
    organizer: str
    description: str
    duration: str
    mode: str # Online, Hybrid, Onsite
    skills_covered: Optional[List[str]] = []
    eligibility: Optional[str] = ""
    deadline: Optional[str] = ""

@router.post("/onboarding")
async def academician_onboarding(req: AcademicianOnboardingRequest, current_user: dict = Depends(require_roles(["academician"]))):
    user_id = current_user["_id"]
    now = datetime.now(timezone.utc).isoformat()
    
    acad_col = get_academician_profiles_col()
    users_col = get_users_col()

    profile_data = {
        "user_id": user_id,
        "full_name": current_user.get("full_name", ""),
        "email": current_user.get("email", ""),
        "institution_name": req.institution_name,
        "department": req.department,
        "designation": req.designation,
        "qualifications": req.qualifications,
        "research_interests": req.research_interests or [],
        "courses_taught": req.courses_taught or [],
        "industry_experience_years": req.industry_experience_years or 0,
        "mentorship_available": req.mentorship_available if req.mentorship_available is not None else True,
        "bio": req.bio,
        "publications": [],
        "is_completed": True,
        "updated_at": now
    }

    existing = await acad_col.find_one({"user_id": user_id})
    if existing:
        await acad_col.update_one({"user_id": user_id}, {"$set": profile_data})
    else:
        profile_data["_id"] = str(uuid.uuid4())
        profile_data["created_at"] = now
        await acad_col.insert_one(profile_data)

    await users_col.update_one({"_id": user_id}, {"$set": {"is_onboarded": True}})
    return {"message": "Academician profile set up successfully", "profile": profile_data}

@router.get("/profile")
async def get_academician_profile(current_user: dict = Depends(require_roles(["academician"]))):
    user_id = current_user["_id"]
    acad_col = get_academician_profiles_col()
    profile = await acad_col.find_one({"user_id": user_id})
    if not profile:
        profile = {
            "user_id": user_id,
            "full_name": current_user.get("full_name"),
            "email": current_user.get("email")
        }
    profile["avatar_url"] = current_user.get("avatar_url", "")
    return {"profile": profile}

@router.put("/profile")
async def update_academician_profile(req: UpdateAcademicianProfileRequest, current_user: dict = Depends(require_roles(["academician"]))):
    user_id = current_user["_id"]
    acad_col = get_academician_profiles_col()
    users_col = get_users_col()

    update_data = {k: v for k, v in req.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    if req.full_name:
        await users_col.update_one({"_id": user_id}, {"$set": {"full_name": req.full_name}})

    await acad_col.update_one({"user_id": user_id}, {"$set": update_data})
    return {"message": "Academician profile updated successfully"}

@router.get("/programs")
async def list_faculty_programs():
    prog_col = get_faculty_programs_col()
    programs = await prog_col.find().sort("created_at", -1).to_list(50)
    return {"programs": programs}

@router.post("/programs")
async def create_faculty_program(req: CreateFacultyProgramRequest, current_user: dict = Depends(require_roles(["academician", "recruiter", "institution", "admin"]))):
    prog_col = get_faculty_programs_col()
    now = datetime.now(timezone.utc).isoformat()

    program_doc = {
        "_id": str(uuid.uuid4()),
        "creator_id": current_user["_id"],
        "creator_role": current_user["role"],
        "title": req.title,
        "type": req.type,
        "organizer": req.organizer,
        "description": req.description,
        "duration": req.duration,
        "mode": req.mode,
        "skills_covered": req.skills_covered or [],
        "eligibility": req.eligibility,
        "deadline": req.deadline,
        "applicants": [],
        "created_at": now
    }

    await prog_col.insert_one(program_doc)
    return {"message": "Collaboration program created successfully", "program": program_doc}

@router.post("/programs/{program_id}/apply")
async def apply_to_faculty_program(program_id: str, current_user: dict = Depends(require_roles(["academician"]))):
    prog_col = get_faculty_programs_col()
    user_id = current_user["_id"]
    
    app_entry = {
        "user_id": user_id,
        "full_name": current_user.get("full_name"),
        "email": current_user.get("email"),
        "applied_at": datetime.now(timezone.utc).isoformat()
    }

    await prog_col.update_one(
        {"_id": program_id},
        {"$push": {"applicants": app_entry}}
    )
    return {"message": "Application for collaboration program submitted successfully"}
