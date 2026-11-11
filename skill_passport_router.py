import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from database import get_student_profiles_col, get_notifications_col
from auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/skill-passport", tags=["Digital Skill Passport"])

class AddSkillRequest(BaseModel):
    name: str
    category: Optional[str] = "Technical" # Technical, Soft Skill, Domain
    proficiency: float = 60.0
    evidence_url: Optional[str] = ""
    evidence_type: Optional[str] = "" # GitHub Project, Certificate, Assessment, Faculty Recommendation

class SubmitEvidenceRequest(BaseModel):
    skill_id: str
    evidence_url: str
    evidence_type: str
    notes: Optional[str] = ""

class UpdateSkillProficiencyRequest(BaseModel):
    skill_id: str
    proficiency: float

@router.get("")
async def get_skill_passport(current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    student_col = get_student_profiles_col()
    profile = await student_col.find_one({"user_id": user_id}) or {}
    
    skills = profile.get("skills", [])
    
    # Categorize skills into statuses
    self_declared = [s for s in skills if s.get("evidence_status") == "self_declared" and not s.get("verified")]
    evidence_submitted = [s for s in skills if s.get("evidence_status") == "evidence_submitted" and not s.get("verified")]
    verified = [s for s in skills if s.get("verified") or s.get("evidence_status") == "verified"]

    return {
        "passport": {
            "total_skills": len(skills),
            "verified_count": len(verified),
            "evidence_submitted_count": len(evidence_submitted),
            "self_declared_count": len(self_declared),
            "skills": skills,
            "verified_skills": verified,
            "evidence_submitted_skills": evidence_submitted,
            "self_declared_skills": self_declared
        }
    }

@router.post("/skills")
async def add_skill(req: AddSkillRequest, current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    student_col = get_student_profiles_col()
    profile = await student_col.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    skills = profile.get("skills", [])
    now = datetime.now(timezone.utc).isoformat()
    
    # Check if skill already exists
    for s in skills:
        if s.get("name", "").strip().lower() == req.name.strip().lower():
            raise HTTPException(status_code=400, detail=f"Skill '{req.name}' is already in your Skill Passport.")

    evidence_status = "evidence_submitted" if req.evidence_url else "self_declared"
    new_skill = {
        "id": str(uuid.uuid4()),
        "name": req.name.strip(),
        "category": req.category or "Technical",
        "proficiency": max(min(req.proficiency, 100.0), 10.0),
        "verified": False,
        "evidence_status": evidence_status,
        "evidence_url": req.evidence_url,
        "evidence_type": req.evidence_type,
        "added_at": now
    }

    await student_col.update_one(
        {"user_id": user_id},
        {"$push": {"skills": new_skill}, "$set": {"updated_at": now}}
    )

    return {"message": "Skill added to Skill Passport", "skill": new_skill}

@router.post("/evidence")
async def submit_skill_evidence(req: SubmitEvidenceRequest, current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    student_col = get_student_profiles_col()
    profile = await student_col.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    skills = profile.get("skills", [])
    skill_found = False
    now = datetime.now(timezone.utc).isoformat()

    for s in skills:
        if s.get("id") == req.skill_id or s.get("name", "").lower() == req.skill_id.lower():
            skill_found = True
            s["evidence_status"] = "evidence_submitted"
            s["evidence_url"] = req.evidence_url
            s["evidence_type"] = req.evidence_type
            s["evidence_notes"] = req.notes
            s["evidence_submitted_at"] = now
            break

    if not skill_found:
        raise HTTPException(status_code=404, detail="Skill not found in your Skill Passport")

    await student_col.update_one(
        {"user_id": user_id},
        {"$set": {"skills": skills, "updated_at": now}}
    )

    return {"message": "Evidence submitted successfully. Skill status promoted to Evidence Submitted."}

@router.put("/skills/{skill_id}/proficiency")
async def update_proficiency(skill_id: str, req: UpdateSkillProficiencyRequest, current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    student_col = get_student_profiles_col()
    profile = await student_col.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    skills = profile.get("skills", [])
    now = datetime.now(timezone.utc).isoformat()
    for s in skills:
        if s.get("id") == skill_id:
            s["proficiency"] = max(min(req.proficiency, 100.0), 10.0)
            s["updated_at"] = now
            break

    await student_col.update_one(
        {"user_id": user_id},
        {"$set": {"skills": skills, "updated_at": now}}
    )

    return {"message": "Skill proficiency updated"}

@router.delete("/skills/{skill_id}")
async def delete_skill(skill_id: str, current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    student_col = get_student_profiles_col()
    profile = await student_col.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    skills = [s for s in profile.get("skills", []) if s.get("id") != skill_id]
    await student_col.update_one(
        {"user_id": user_id},
        {"$set": {"skills": skills, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )

    return {"message": "Skill removed from passport"}
