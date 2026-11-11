import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from database import (
    get_users_col,
    get_institution_profiles_col,
    get_student_profiles_col,
    get_applications_col,
    get_opportunities_col
)
from auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/institutions", tags=["Institution Portal"])

class InstitutionOnboardingRequest(BaseModel):
    institution_name: str
    aishe_code: Optional[str] = ""
    university_affiliation: Optional[str] = ""
    institution_type: Optional[str] = "University"
    website: Optional[str] = ""
    logo_url: Optional[str] = ""
    address: Optional[str] = ""
    city: Optional[str] = ""
    state: Optional[str] = ""
    placement_officer_name: Optional[str] = ""
    placement_officer_email: Optional[str] = ""
    placement_officer_phone: Optional[str] = ""
    contact_person_designation: Optional[str] = ""
    departments: Optional[List[str]] = []
    degrees_offered: Optional[List[str]] = []

class UpdateInstitutionProfileRequest(BaseModel):
    institution_name: Optional[str] = None
    aishe_code: Optional[str] = None
    university_affiliation: Optional[str] = None
    institution_type: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    placement_officer_name: Optional[str] = None
    placement_officer_email: Optional[str] = None
    placement_officer_phone: Optional[str] = None
    departments: Optional[List[str]] = None
    degrees_offered: Optional[List[str]] = None

@router.post("/onboarding")
async def institution_onboarding(req: InstitutionOnboardingRequest, current_user: dict = Depends(require_roles(["institution"]))):
    user_id = current_user["_id"]
    now = datetime.now(timezone.utc).isoformat()
    
    inst_col = get_institution_profiles_col()
    users_col = get_users_col()

    profile_data = {
        "user_id": user_id,
        "institution_name": req.institution_name,
        "aishe_code": req.aishe_code,
        "university_affiliation": req.university_affiliation,
        "institution_type": req.institution_type,
        "website": req.website,
        "logo_url": req.logo_url,
        "address": req.address,
        "city": req.city,
        "state": req.state,
        "placement_officer_name": req.placement_officer_name,
        "placement_officer_email": req.placement_officer_email,
        "placement_officer_phone": req.placement_officer_phone,
        "departments": req.departments or ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil"],
        "degrees_offered": req.degrees_offered or ["B.Tech", "M.Tech", "MCA", "B.Sc", "MBA"],
        "is_completed": True,
        "updated_at": now
    }

    existing = await inst_col.find_one({"user_id": user_id})
    if existing:
        await inst_col.update_one({"user_id": user_id}, {"$set": profile_data})
    else:
        profile_data["_id"] = str(uuid.uuid4())
        profile_data["created_at"] = now
        await inst_col.insert_one(profile_data)

    await users_col.update_one({"_id": user_id}, {"$set": {"is_onboarded": True}})
    return {"message": "Institution profile configured", "profile": profile_data}

@router.get("/profile")
async def get_institution_profile(current_user: dict = Depends(require_roles(["institution"]))):
    user_id = current_user["_id"]
    inst_col = get_institution_profiles_col()
    profile = await inst_col.find_one({"user_id": user_id})
    if not profile:
        profile = {
            "user_id": user_id,
            "institution_name": current_user.get("full_name"),
            "contact_email": current_user.get("email"),
            "departments": []
        }
    return {"profile": profile}

@router.put("/profile")
async def update_institution_profile(req: UpdateInstitutionProfileRequest, current_user: dict = Depends(require_roles(["institution"]))):
    user_id = current_user["_id"]
    inst_col = get_institution_profiles_col()
    update_data = {k: v for k, v in req.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await inst_col.update_one({"user_id": user_id}, {"$set": update_data})
    return {"message": "Institution profile updated successfully"}

@router.get("/analytics")
async def get_institution_analytics(current_user: dict = Depends(require_roles(["institution", "admin"]))):
    user_id = current_user["_id"]
    inst_col = get_institution_profiles_col()
    student_col = get_student_profiles_col()
    apps_col = get_applications_col()

    profile = await inst_col.find_one({"user_id": user_id}) or {}
    inst_name = profile.get("institution_name", "")

    # Query students associated with this institution name or all students if query matches
    query = {}
    if inst_name:
        query = {"academic.institution_name": {"$regex": inst_name, "$options": "i"}}

    students = await student_col.find(query).to_list(500)
    
    total_students = len(students)
    if total_students == 0:
        # Also include general platform registered students for analytics preview if specific institution match is empty
        all_students = await student_col.find().to_list(500)
        if all_students:
            students = all_students
            total_students = len(students)

    # Department distribution
    dept_map = {}
    skill_frequency = {}
    total_cgpa = 0.0
    cgpa_count = 0
    students_with_apps = 0
    student_ids = []

    for s in students:
        student_ids.append(s.get("user_id"))
        dept = s.get("academic", {}).get("department") or "General Engineering"
        dept_map[dept] = dept_map.get(dept, 0) + 1

        cgpa = float(s.get("academic", {}).get("cgpa") or 0)
        if cgpa > 0:
            total_cgpa += cgpa
            cgpa_count += 1

        for sk in s.get("skills", []):
            sk_name = sk.get("name", "").title()
            if sk_name:
                skill_frequency[sk_name] = skill_frequency.get(sk_name, 0) + 1

    avg_cgpa = round(total_cgpa / max(cgpa_count, 1), 2) if cgpa_count else 0.0

    # Application metrics for these students
    total_applications = 0
    selected_count = 0
    if student_ids:
        total_applications = await apps_col.count_documents({"applicant_id": {"$in": student_ids}})
        selected_count = await apps_col.count_documents({"applicant_id": {"$in": student_ids}, "status": {"$in": ["Selected", "Offer Accepted"]}})

    # Top skills format for charts
    top_skills = [{"skill": k, "count": v} for k, v in sorted(skill_frequency.items(), key=lambda x: x[1], reverse=True)[:8]]
    department_stats = [{"department": k, "students": v} for k, v in dept_map.items()]

    return {
        "institution_name": inst_name or "Partner Institution",
        "has_data": total_students > 0,
        "metrics": {
            "total_students": total_students,
            "average_cgpa": avg_cgpa,
            "total_applications": total_applications,
            "placed_students": selected_count,
            "placement_rate": round((selected_count / max(total_students, 1)) * 100, 1) if total_students else 0.0
        },
        "department_distribution": department_stats,
        "top_skills": top_skills,
        "students_preview": [
            {
                "id": s.get("user_id"),
                "full_name": s.get("full_name"),
                "department": s.get("academic", {}).get("department", "N/A"),
                "cgpa": s.get("academic", {}).get("cgpa", 0.0),
                "graduation_year": s.get("academic", {}).get("graduation_year", "N/A"),
                "skills_count": len(s.get("skills", [])),
                "verified_skills_count": sum(1 for sk in s.get("skills", []) if sk.get("verified"))
            }
            for s in students[:10]
        ]
    }
