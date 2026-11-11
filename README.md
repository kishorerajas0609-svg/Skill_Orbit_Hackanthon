# SkillOrbit

SkillOrbit is an AI-powered career and skill ecosystem designed to connect students, recruiters, institutions, academicians, and administrators in one unified platform. The project supports skill profiling, opportunity discovery, personalized roadmap generation, assessment workflows, and role-based dashboards for different stakeholders.

## Overview

SkillOrbit helps users:

- Build and manage a digital skill passport
- Discover jobs and internship opportunities
- Track applications and match quality
- Take guided assessments and learning diagnostics
- Receive AI-based recommendations and career roadmaps
- Enable institutions and academicians to monitor student growth
- Support recruiter and admin workflows through role-based portals

## Key Features

### Student Experience
- Personalized student dashboard
- Skill passport management
- Career opportunity exploration
- AI-assisted roadmap generation
- Application tracking and opportunity matching
- Assessment and evaluation workflows

### Recruiter Experience
- Post and manage job opportunities
- Review applications and candidate profiles
- Search candidates by skill profile and match strength
- Monitor opportunity performance

### Institutional and Academic Experience
- Student directory and institutional insights
- Academic dashboards for learner progress and outcomes
- Role-based onboarding and access controls

### Administration
- User management and platform oversight
- Role-based access controls
- Platform-wide coordination and monitoring

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts and charting utilities

### Backend
- Python
- FastAPI
- MongoDB
- JWT authentication
- Google OAuth support
- Google Gemini AI integration

## Project Architecture

This repository includes both the client application and the backend service:

- Frontend entry points such as `App.tsx`, `main.tsx`, and UI components
- API routes for authentication, students, recruiters, institutions, academicians, opportunities, assessments, AI, notifications, and uploads
- Core backend files such as `main.py`, `database.py`, `config.py`, `security.py`, and `matching_engine.py`

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB instance
- Google Gemini API key
- Google OAuth credentials

### 1. Clone the repository

```bash
git clone https://github.com/kishorerajas0609-svg/Skill_Orbit_Hackanthon.git
cd Skill_Orbit_Hackanthon
```

### 2. Frontend setup

```bash
npm install
npm run dev
```

The frontend runs on the Vite development server, typically at:

```text
http://localhost:5173
```

### 3. Backend setup

Create a virtual environment and install Python dependencies:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install fastapi uvicorn pymongo python-dotenv pyjwt passlib bcrypt python-multipart google-generativeai
```

Then start the backend:

```bash
python main.py
```

The API server runs at:

```text
http://localhost:8000
```

## Environment Configuration

Copy the sample environment file and configure your local values:

```bash
cp .env.example .env
```

Update the variables for MongoDB, JWT secrets, Google OAuth, Gemini API, and frontend/backend URLs.

Example values include:

```env
DATABASE_URL=mongodb://localhost:27017
DATABASE_NAME=skillorbit_db
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
```

## Default Admin Account

The backend seeds a default admin account on startup if none exists:

- Email: `admin@skillorbit.com`
- Password: `Admin@SkillOrbit2026!`

## Useful Scripts

```bash
npm run dev      # Start frontend development server
npm run build    # Build production frontend bundle
npm run preview  # Preview production build
npm run lint     # Run static lint checks
```

## Notes

This repository is structured as a full-stack product demo/Hackathon application and includes both user-facing portals and backend logic for a complete skill-platform workflow.

## License

This project is for educational and demonstration purposes as part of the Skill Orbit Hackathon build.
