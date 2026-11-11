from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from database import get_notifications_col
from auth.dependencies import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
async def get_my_notifications(current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    notifs_col = get_notifications_col()
    notifs = await notifs_col.find({"user_id": user_id}).sort("created_at", -1).to_list(50)
    unread_count = sum(1 for n in notifs if not n.get("read"))
    return {"notifications": notifs, "unread_count": unread_count}

@router.put("/{notif_id}/read")
async def mark_notification_read(notif_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    notifs_col = get_notifications_col()
    await notifs_col.update_one(
        {"_id": notif_id, "user_id": user_id},
        {"$set": {"read": True}}
    )
    return {"message": "Notification marked as read"}

@router.put("/read-all")
async def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    notifs_col = get_notifications_col()
    await notifs_col.update_many(
        {"user_id": user_id, "read": False},
        {"$set": {"read": True}}
    )
    return {"message": "All notifications marked as read"}
