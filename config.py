import os

class Settings:
    PROJECT_NAME: str = "SkillOrbit API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Secrets
    JWT_SECRET: str = os.getenv("JWT_SECRET", "skillorbit_super_secret_jwt_key_prod_2026_x89a")
    JWT_REFRESH_SECRET: str = os.getenv("JWT_REFRESH_SECRET", "skillorbit_super_refresh_jwt_key_prod_2026_y90b")
    ALGORITHM: str = "HS256"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", os.getenv("MONGODB_URI", "mongodb://localhost:27017"))
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "skillorbit_db")
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:5173/auth/google/callback")
    
    # Gemini AI
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # URLs
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    
    # Storage
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")

settings = Settings()
