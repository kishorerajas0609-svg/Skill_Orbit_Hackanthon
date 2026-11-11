import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from database import (
    get_users_col,
    get_student_profiles_col,
    get_skill_passport_col,
    get_assessment_attempts_col,
    get_applications_col
)
from auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/students", tags=["Student Profile & Features"])

class StudentOnboardingRequest(BaseModel):
    # Personal
    phone: Optional[str] = ""
    bio: Optional[str] = ""
    location: Optional[str] = ""
    linkedin_url: Optional[str] = ""
    github_url: Optional[str] = ""
    portfolio_url: Optional[str] = ""
    # Academic
    institution_name: str
    department: str
    degree: str
    current_year: int
    graduation_year: int
    cgpa: float
    enrollment_number: Optional[str] = ""
    # Career & Skills
    dream_role: str
    work_mode_preference: Optional[str] = "any" # onsite, remote, hybrid, any
    preferred_locations: Optional[List[str]] = []
    initial_skills: Optional[List[Dict[str, Any]]] = []

class UpdatePersonalDetailsRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None

class UpdateAcademicDetailsRequest(BaseModel):
    institution_name: Optional[str] = None
    department: Optional[str] = None
    degree: Optional[str] = None
    current_year: Optional[int] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None
    enrollment_number: Optional[str] = None

class UpdateCareerPreferencesRequest(BaseModel):
    dream_role: Optional[str] = None
    secondary_role: Optional[str] = None
    work_mode_preference: Optional[str] = None
    preferred_locations: Optional[List[str]] = None
    expected_salary: Optional[str] = None

class ProjectItem(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    technologies: List[str]
    role: Optional[str] = ""
    github_url: Optional[str] = ""
    live_url: Optional[str] = ""
    start_date: Optional[str] = ""
    end_date: Optional[str] = ""

class ExperienceItem(BaseModel):
    id: Optional[str] = None
    company_name: str
    role_title: str
    work_type: Optional[str] = "Internship" # Internship, Full-time, Volunteer
    location: Optional[str] = ""
    start_date: str
    end_date: Optional[str] = ""
    is_current: Optional[bool] = False
    description: str
    skills_used: Optional[List[str]] = []

class CertificateItem(BaseModel):
    id: Optional[str] = None
    title: str
    issuer: str
    credential_id: Optional[str] = ""
    credential_url: Optional[str] = ""
    issue_date: str
    expiry_date: Optional[str] = ""
    document_url: Optional[str] = ""

def calculate_placement_readiness(profile: Dict[str, Any], skill_count: int, verified_count: int, attempts_count: int) -> Dict[str, Any]:
    """Calculates placement readiness score from real data."""
    # 1. Profile completeness (25 pts)
    academic = profile.get("academic", {})
    academic_score = 0
    if academic.get("institution_name"): academic_score += 5
    if academic.get("department"): academic_score += 5
    if academic.get("degree"): academic_score += 5
    if academic.get("cgpa", 0) > 0: academic_score += 5
    if profile.get("bio"): academic_score += 5

    # 2. Skill Passport & Verifications (30 pts)
    skill_score = min(skill_count * 3, 15) + min(verified_count * 5, 15)

    # 3. Projects & Practical Evidence (25 pts)
    projects = profile.get("projects", [])
    project_score = min(len(projects) * 10, 25)

    # 4. Assessments & Evaluations (20 pts)
    assessment_score = min(attempts_count * 10, 20)

    total_readiness = min(academic_score + skill_score + project_score + assessment_score, 100)

    return {
        "overall_score": total_readiness,
        "academic_completeness": academic_score,
        "skill_passport_score": skill_score,
        "project_portfolio_score": project_score,
        "assessment_score": assessment_score,
        "tier": "Industry Ready" if total_readiness >= 80 else "Placement Eligible" if total_readiness >= 50 else "Building Foundation"
    }

@router.post("/onboarding")
async def student_onboarding(req: StudentOnboardingRequest, current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    now = datetime.now(timezone.utc).isoformat()
    
    student_col = get_student_profiles_col()
    users_col = get_users_col()

    # Format initial skills with self_declared status
    formatted_skills = []
    for s in (req.initial_skills or []):
        formatted_skills.append({
            "id": str(uuid.uuid4()),
            "name": s.get("name", "").strip(),
            "proficiency": float(s.get("proficiency", 60)),
            "category": s.get("category", "Technical"),
            "verified": False,
            "evidence_status": "self_declared",
            "added_at": now
        })

    profile_data = {
        "user_id": user_id,
        "full_name": current_user.get("full_name", ""),
        "email": current_user.get("email", ""),
        "phone": req.phone,
        "bio": req.bio,
        "location": req.location,
        "linkedin_url": req.linkedin_url,
        "github_url": req.github_url,
        "portfolio_url": req.portfolio_url,
        "academic": {
            "institution_name": req.institution_name,
            "department": req.department,
            "degree": req.degree,
            "current_year": req.current_year,
            "graduation_year": req.graduation_year,
            "cgpa": req.cgpa,
            "enrollment_number": req.enrollment_number
        },
        "career_target": {
            "dream_role": req.dream_role,
            "updated_at": now
        },
        "career_preferences": {
            "dream_role": req.dream_role,
            "work_mode_preference": req.work_mode_preference,
            "preferred_locations": req.preferred_locations or []
        },
        "skills": formatted_skills,
        "is_completed": True,
        "updated_at": now
    }

    # Update or insert profile
    existing = await student_col.find_one({"user_id": user_id})
    if existing:
        await student_col.update_one({"user_id": user_id}, {"$set": profile_data})
    else:
        profile_data["_id"] = str(uuid.uuid4())
        profile_data["projects"] = []
        profile_data["experience"] = []
        profile_data["certificates"] = []
        profile_data["visibility"] = {"profile": "public", "recruiter_view": True}
        profile_data["created_at"] = now
        await student_col.insert_one(profile_data)

    # Mark user as onboarded
    await users_col.update_one({"_id": user_id}, {"$set": {"is_onboarded": True}})

    return {
        "message": "Onboarding completed successfully",
        "profile": profile_data,
        "user": {
            "id": user_id,
            "_id": user_id,
            "is_onboarded": True,
            "role": "student",
            "full_name": current_user.get("full_name", ""),
            "email": current_user.get("email", "")
        }
    }

@router.get("/profile")
async def get_my_profile(current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    student_col = get_student_profiles_col()
    profile = await student_col.find_one({"user_id": user_id})
    
    if not profile:
        # Create blank profile if missing
        now = datetime.now(timezone.utc).isoformat()
        profile = {
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "full_name": current_user.get("full_name", ""),
            "email": current_user.get("email", ""),
            "avatar_url": current_user.get("avatar_url", ""),
            "academic": {},
            "skills": [],
            "projects": [],
            "experience": [],
            "certificates": [],
            "career_target": {},
            "career_preferences": {},
            "visibility": {"profile": "public", "recruiter_view": True},
            "created_at": now
        }
        await student_col.insert_one(profile)

    # Calculate real-time readiness stats
    skills = profile.get("skills", [])
    verified_count = sum(1 for s in skills if s.get("verified"))
    attempts_count = await get_assessment_attempts_col().count_documents({"user_id": user_id})
    
    readiness = calculate_placement_readiness(profile, len(skills), verified_count, attempts_count)
    profile["readiness"] = readiness
    profile["avatar_url"] = current_user.get("avatar_url", "")

    return {"profile": profile}

@router.get("/dashboard")
async def get_student_dashboard(current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    student_col = get_student_profiles_col()
    profile = await student_col.find_one({"user_id": user_id}) or {}

    skills = profile.get("skills", [])
    verified_skills = [s for s in skills if s.get("verified")]
    
    # Live stats from collections
    apps_col = get_applications_col()
    active_apps_count = await apps_col.count_documents({"applicant_id": user_id, "status": {"$ne": "Withdrawn"}})
    shortlisted_count = await apps_col.count_documents({"applicant_id": user_id, "status": {"$in": ["Shortlisted", "Interview", "Selected"]}})
    
    attempts_col = get_assessment_attempts_col()
    recent_attempts = await attempts_col.find({"user_id": user_id}).sort("completed_at", -1).limit(5).to_list()

    readiness = calculate_placement_readiness(profile, len(skills), len(verified_skills), len(recent_attempts))

    return {
        "user": {
            "full_name": current_user.get("full_name"),
            "email": current_user.get("email"),
            "avatar_url": current_user.get("avatar_url", ""),
            "is_onboarded": current_user.get("is_onboarded", False)
        },
        "readiness": readiness,
        "stats": {
            "total_skills": len(skills),
            "verified_skills": len(verified_skills),
            "active_applications": active_apps_count,
            "shortlisted_applications": shortlisted_count,
            "completed_assessments": len(recent_attempts),
            "projects_count": len(profile.get("projects", []))
        },
        "dream_role": profile.get("career_target", {}).get("dream_role", "Not specified"),
        "recent_assessments": recent_attempts,
        "academic": profile.get("academic", {})
    }

@router.put("/personal")
async def update_personal_details(req: UpdatePersonalDetailsRequest, current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    student_col = get_student_profiles_col()
    users_col = get_users_col()
    
    update_data = {k: v for k, v in req.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    if req.full_name:
        await users_col.update_one({"_id": user_id}, {"$set": {"full_name": req.full_name}})
        
    await student_col.update_one({"user_id": user_id}, {"$set": update_data})
    return {"message": "Personal details updated successfully"}

@router.put("/academic")
async def update_academic_details(req: UpdateAcademicDetailsRequest, current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    student_col = get_student_profiles_col()
    
    academic_dict = {f"academic.{k}": v for k, v in req.dict().items() if v is not None}
    academic_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await student_col.update_one({"user_id": user_id}, {"$set": academic_dict})
    return {"message": "Academic information updated"}

@router.put("/career-preferences")
async def update_career_preferences(req: UpdateCareerPreferencesRequest, current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    student_col = get_student_profiles_col()
    now = datetime.now(timezone.utc).isoformat()
    
    pref_dict = {f"career_preferences.{k}": v for k, v in req.dict().items() if v is not None}
    if req.dream_role:
        pref_dict["career_target.dream_role"] = req.dream_role
    pref_dict["updated_at"] = now
    
    await student_col.update_one({"user_id": user_id}, {"$set": pref_dict})
    return {"message": "Career preferences saved"}

# Projects CRUD
@router.post("/projects")
async def add_project(project: ProjectItem, current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    student_col = get_student_profiles_col()
    
    p_dict = project.dict()
    p_dict["id"] = str(uuid.uuid4())
    p_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await student_col.update_one({"user_id": user_id}, {"$push": {"projects": p_dict}})
    return {"message": "Project added successfully", "project": p_dict}

@router.delete("/projects/{project_id}")
async def delete_project(project_id: str, current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    student_col = get_student_profiles_col()
    
    profile = await student_col.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    projects = [p for p in profile.get("projects", []) if p.get("id") != project_id]
    await student_col.update_one({"user_id": user_id}, {"$set": {"projects": projects}})
    return {"message": "Project removed"}

# Experience CRUD
@router.post("/experience")
async def add_experience(exp: ExperienceItem, current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    student_col = get_student_profiles_col()
    
    exp_dict = exp.dict()
    exp_dict["id"] = str(uuid.uuid4())
    exp_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await student_col.update_one({"user_id": user_id}, {"$push": {"experience": exp_dict}})
    return {"message": "Experience record added", "experience": exp_dict}

@router.delete("/experience/{exp_id}")
async def delete_experience(exp_id: str, current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    student_col = get_student_profiles_col()
    
    profile = await student_col.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    exps = [e for e in profile.get("experience", []) if e.get("id") != exp_id]
    await student_col.update_one({"user_id": user_id}, {"$set": {"experience": exps}})
    return {"message": "Experience record removed"}

# Certificates CRUD
@router.post("/certificates")
async def add_certificate(cert: CertificateItem, current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    student_col = get_student_profiles_col()
    
    c_dict = cert.dict()
    c_dict["id"] = str(uuid.uuid4())
    c_dict["status"] = "Verified" if cert.document_url or cert.credential_url else "Self-declared"
    c_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await student_col.update_one({"user_id": user_id}, {"$push": {"certificates": c_dict}})
    return {"message": "Certificate added", "certificate": c_dict}

@router.delete("/certificates/{cert_id}")
async def delete_certificate(cert_id: str, current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    student_col = get_student_profiles_col()
    
    profile = await student_col.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    certs = [c for c in profile.get("certificates", []) if c.get("id") != cert_id]
    await student_col.update_one({"user_id": user_id}, {"$set": {"certificates": certs}})
    return {"message": "Certificate removed"}
