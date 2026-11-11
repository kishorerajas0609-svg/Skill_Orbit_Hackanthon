import os
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from config import settings
from database import get_users_col, get_student_profiles_col
from auth.dependencies import get_current_user

router = APIRouter(prefix="/upload", tags=["File Storage & Uploads"])

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
ALLOWED_DOC_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Allowed formats: JPG, PNG, WEBP, GIF."
        )

    # Read and check size limit (5 MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image size exceeds 5MB limit."
        )

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "")[1] or ".png"
    filename = f"avatar_{current_user['_id']}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    avatar_url = f"{settings.BACKEND_URL}/uploads/{filename}"

    # Update in users collection
    await get_users_col().update_one(
        {"_id": current_user["_id"]},
        {"$set": {"avatar_url": avatar_url}}
    )
    if current_user.get("role") == "student":
        await get_student_profiles_col().update_one(
            {"user_id": current_user["_id"]},
            {"$set": {"avatar_url": avatar_url}}
        )

    return {"message": "Avatar uploaded successfully", "avatar_url": avatar_url}

@router.post("/document")
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    valid_types = ALLOWED_DOC_TYPES + ALLOWED_IMAGE_TYPES
    if file.content_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid document format. Allowed formats: PDF, DOC, DOCX, JPG, PNG."
        )

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document size exceeds 10MB limit."
        )

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "")[1] or ".pdf"
    filename = f"doc_{current_user['_id']}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    doc_url = f"{settings.BACKEND_URL}/uploads/{filename}"
    return {"message": "Document uploaded successfully", "url": doc_url, "filename": file.filename}
