import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from database import (
    get_student_profiles_col,
    get_roadmaps_col
)
from auth.dependencies import get_current_user, require_roles
from services.skill_gap_engine import analyze_skill_gaps, ROLE_BENCHMARKS
from services.gemini_service import gemini_service

router = APIRouter(prefix="/roadmap", tags=["Career Target & Learning Roadmap"])

class SetDreamJobRequest(BaseModel):
    target_role: str

class UpdateMilestoneProgressRequest(BaseModel):
    phase: int
    task_index: int
    completed: bool

@router.get("/available-roles")
async def get_available_roles():
    return {"roles": list(ROLE_BENCHMARKS.keys())}

@router.get("/skill-gaps")
async def get_current_skill_gaps(current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    student_col = get_student_profiles_col()
    profile = await student_col.find_one({"user_id": user_id}) or {}

    target_role = profile.get("career_target", {}).get("dream_role") or "Full Stack Developer"
    skills = profile.get("skills", [])

    gap_analysis = analyze_skill_gaps(target_role, skills)
    return {"gap_analysis": gap_analysis, "target_role": target_role}

@router.post("/set-target-role")
async def set_target_role(req: SetDreamJobRequest, current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    student_col = get_student_profiles_col()
    now = datetime.now(timezone.utc).isoformat()

    await student_col.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "career_target.dream_role": req.target_role,
                "career_preferences.dream_role": req.target_role,
                "updated_at": now
            }
        }
    )

    return {"message": f"Career target role set to {req.target_role}"}

@router.get("/my-roadmap")
async def get_my_roadmap(current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    roadmaps_col = get_roadmaps_col()
    student_col = get_student_profiles_col()

    profile = await student_col.find_one({"user_id": user_id}) or {}
    target_role = profile.get("career_target", {}).get("dream_role") or "Full Stack Developer"

    roadmap = await roadmaps_col.find_one({"user_id": user_id, "target_role": target_role})
    if not roadmap:
        # Generate initial roadmap based on current skill gaps
        skills = profile.get("skills", [])
        gap_analysis = analyze_skill_gaps(target_role, skills)
        phases = await gemini_service.generate_career_roadmap(target_role, gap_analysis)
        explanation = await gemini_service.explain_skill_gap(target_role, gap_analysis)

        now = datetime.now(timezone.utc).isoformat()
        roadmap = {
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "target_role": target_role,
            "readiness_at_generation": gap_analysis["readiness_percentage"],
            "explanation": explanation,
            "phases": phases,
            "progress_state": {},
            "created_at": now,
            "updated_at": now
        }
        await roadmaps_col.insert_one(roadmap)

    return {"roadmap": roadmap}

@router.post("/regenerate")
async def regenerate_roadmap(current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    roadmaps_col = get_roadmaps_col()
    student_col = get_student_profiles_col()

    profile = await student_col.find_one({"user_id": user_id}) or {}
    target_role = profile.get("career_target", {}).get("dream_role") or "Full Stack Developer"
    skills = profile.get("skills", [])

    gap_analysis = analyze_skill_gaps(target_role, skills)
    phases = await gemini_service.generate_career_roadmap(target_role, gap_analysis)
    explanation = await gemini_service.explain_skill_gap(target_role, gap_analysis)

    now = datetime.now(timezone.utc).isoformat()
    updated_roadmap = {
        "user_id": user_id,
        "target_role": target_role,
        "readiness_at_generation": gap_analysis["readiness_percentage"],
        "explanation": explanation,
        "phases": phases,
        "updated_at": now
    }

    await roadmaps_col.update_one(
        {"user_id": user_id, "target_role": target_role},
        {"$set": updated_roadmap},
        upsert=True
    )

    return {"message": "Roadmap refreshed successfully", "roadmap": updated_roadmap}

@router.post("/task-progress")
async def update_task_progress(req: UpdateMilestoneProgressRequest, current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    roadmaps_col = get_roadmaps_col()
    student_col = get_student_profiles_col()

    profile = await student_col.find_one({"user_id": user_id}) or {}
    target_role = profile.get("career_target", {}).get("dream_role") or "Full Stack Developer"

    key = f"progress_state.phase_{req.phase}_task_{req.task_index}"
    await roadmaps_col.update_one(
        {"user_id": user_id, "target_role": target_role},
        {"$set": {key: req.completed, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )

    return {"message": "Milestone task progress updated"}
