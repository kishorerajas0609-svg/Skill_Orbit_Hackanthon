import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config import settings
from database import db_manager, get_users_col
from auth.security import hash_password

# Import routers
from routers.auth_router import router as auth_router
from routers.student_router import router as student_router
from routers.recruiter_router import router as recruiter_router
from routers.institution_router import router as institution_router
from routers.academician_router import router as academician_router
from routers.admin_router import router as admin_router
from routers.opportunities_router import router as opportunities_router
from routers.applications_router import router as applications_router
from routers.assessments_router import router as assessments_router
from routers.skill_passport_router import router as skill_passport_router
from routers.roadmap_router import router as roadmap_router
from routers.ai_router import router as ai_router
from routers.notifications_router import router as notifications_router
from routers.upload_router import router as upload_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database connection
    await db_manager.connect()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Initialize default admin account if not present
    users_col = get_users_col()
    admin_exists = await users_col.find_one({"role": "admin"})
    if not admin_exists:
        from datetime import datetime, timezone
        admin_doc = {
            "_id": "admin-system-master",
            "email": "admin@skillorbit.com",
            "password_hash": hash_password("Admin@SkillOrbit2026!"),
            "full_name": "Platform Super Admin",
            "role": "admin",
            "avatar_url": "",
            "is_verified": True,
            "is_onboarded": True,
            "theme": "dark",
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await users_col.insert_one(admin_doc)
        print(" Seeded Master Admin account: admin@skillorbit.com")

    yield

app = FastAPI(
    title="SkillOrbit API",
    description="Full-stack Academia-Industry Collaboration Platform Backend",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Configuration
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static folder
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Register API Routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(student_router, prefix=settings.API_PREFIX)
app.include_router(recruiter_router, prefix=settings.API_PREFIX)
app.include_router(institution_router, prefix=settings.API_PREFIX)
app.include_router(academician_router, prefix=settings.API_PREFIX)
app.include_router(admin_router, prefix=settings.API_PREFIX)
app.include_router(opportunities_router, prefix=settings.API_PREFIX)
app.include_router(applications_router, prefix=settings.API_PREFIX)
app.include_router(assessments_router, prefix=settings.API_PREFIX)
app.include_router(skill_passport_router, prefix=settings.API_PREFIX)
app.include_router(roadmap_router, prefix=settings.API_PREFIX)
app.include_router(ai_router, prefix=settings.API_PREFIX)
app.include_router(notifications_router, prefix=settings.API_PREFIX)
app.include_router(upload_router, prefix=settings.API_PREFIX)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SkillOrbit Backend Engine",
        "version": settings.VERSION,
        "database_connected": db_manager.is_connected
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
