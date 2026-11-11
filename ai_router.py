import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from database import (
    get_chat_sessions_col,
    get_chat_messages_col,
    get_student_profiles_col,
    get_recruiter_profiles_col,
    get_institution_profiles_col
)
from auth.dependencies import get_current_user
from services.gemini_service import gemini_service

router = APIRouter(prefix="/ai", tags=["SkillOrbit AI Co-Pilot & Gemini Integration"])

class SendChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class GenerateJDRequest(BaseModel):
    title: str
    department: str
    skills: List[str]
    experience_level: Optional[str] = "Entry / Mid Level"

@router.get("/sessions")
async def get_chat_sessions(current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    sessions_col = get_chat_sessions_col()
    sessions = await sessions_col.find({"user_id": user_id}).sort("updated_at", -1).to_list(30)
    return {"sessions": sessions}

@router.get("/sessions/{session_id}/messages")
async def get_session_messages(session_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    messages_col = get_chat_messages_col()
    messages = await messages_col.find({"session_id": session_id, "user_id": user_id}).sort("timestamp", 1).to_list(100)
    return {"messages": messages}

@router.post("/chat")
async def chat_with_assistant(req: SendChatMessageRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    role = current_user.get("role", "student")
    now = datetime.now(timezone.utc).isoformat()
    
    sessions_col = get_chat_sessions_col()
    messages_col = get_chat_messages_col()

    # Get or create chat session
    session_id = req.session_id
    if not session_id:
        session_id = str(uuid.uuid4())
        session_title = req.message[:35] + ("..." if len(req.message) > 35 else "")
        await sessions_col.insert_one({
            "_id": session_id,
            "user_id": user_id,
            "role": role,
            "title": session_title,
            "created_at": now,
            "updated_at": now
        })
    else:
        await sessions_col.update_one({"_id": session_id}, {"$set": {"updated_at": now}})

    # Fetch recent messages for session context
    past_messages = await messages_col.find({"session_id": session_id}).sort("timestamp", 1).to_list(10)
    msg_history = [{"role": m.get("sender"), "content": m.get("content")} for m in past_messages]
    msg_history.append({"role": "user", "content": req.message})

    # Save user message
    user_msg_id = str(uuid.uuid4())
    await messages_col.insert_one({
        "_id": user_msg_id,
        "session_id": session_id,
        "user_id": user_id,
        "sender": "user",
        "content": req.message,
        "timestamp": now
    })

    # Build safe role-context
    user_context = {"role": role, "name": current_user.get("full_name")}
    if role == "student":
        stu = await get_student_profiles_col().find_one({"user_id": user_id})
        if stu:
            user_context["target_role"] = stu.get("career_target", {}).get("dream_role")
            user_context["skills_summary"] = [s.get("name") for s in stu.get("skills", [])[:6]]
            user_context["readiness"] = stu.get("readiness", {}).get("overall_score")
    elif role == "recruiter":
        rec = await get_recruiter_profiles_col().find_one({"user_id": user_id})
        if rec:
            user_context["company"] = rec.get("company_name")
            user_context["industry"] = rec.get("industry")

    # Call Gemini securely
    ai_response_text = await gemini_service.chat_with_assistant(role, msg_history, user_context)

    # Save assistant response
    assistant_msg_id = str(uuid.uuid4())
    ai_now = datetime.now(timezone.utc).isoformat()
    await messages_col.insert_one({
        "_id": assistant_msg_id,
        "session_id": session_id,
        "user_id": user_id,
        "sender": "assistant",
        "content": ai_response_text,
        "timestamp": ai_now
    })

    return {
        "session_id": session_id,
        "message": ai_response_text,
        "reply": ai_response_text,
        "timestamp": ai_now
    }

@router.delete("/sessions/{session_id}")
async def delete_chat_session(session_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    await get_chat_sessions_col().delete_one({"_id": session_id, "user_id": user_id})
    await get_chat_messages_col().delete_many({"session_id": session_id, "user_id": user_id})
    return {"message": "Chat session cleared"}

@router.get("/resume-analysis")
async def get_resume_analysis(current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    stu = await get_student_profiles_col().find_one({"user_id": user_id}) or {}
    analysis = await gemini_service.analyze_resume_and_profile(stu)
    return {"analysis": analysis}

@router.post("/generate-jd")
async def generate_recruiter_jd(req: GenerateJDRequest, current_user: dict = Depends(get_current_user)):
    jd = await gemini_service.generate_job_description(req.title, req.department, req.skills, req.experience_level)
    return {"job_description": jd}
