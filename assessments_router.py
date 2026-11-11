import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from database import (
    get_assessment_attempts_col,
    get_student_profiles_col,
    get_notifications_col
)
from auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/assessments", tags=["Skill Assessments & Testing Engine"])

# Real structured question bank with categories, questions, options, correct answers, and topics
ASSESSMENT_QUESTION_BANK = {
    "Python": {
        "title": "Python Core & Advanced Programming",
        "description": "Evaluate knowledge of data structures, OOP, generators, decorators, memory management, and asynchronous programming in Python.",
        "duration_minutes": 15,
        "questions": [
            {
                "id": "py-1",
                "question": "What is the time complexity of searching for a key in a standard Python dictionary in average vs worst case?",
                "options": [
                    "O(1) average, O(n) worst case",
                    "O(n) average, O(n log n) worst case",
                    "O(log n) average, O(1) worst case",
                    "O(1) in all cases"
                ],
                "correct_index": 0,
                "topic": "Dictionaries & Hashing"
            },
            {
                "id": "py-2",
                "question": "Which decorator in Python is used to create a generator function or modify method binding to an instance class?",
                "options": [
                    "@staticmethod",
                    "@classmethod",
                    "@property",
                    "@functools.wraps"
                ],
                "correct_index": 1,
                "topic": "OOP & Class Methods"
            },
            {
                "id": "py-3",
                "question": "How does Python's GIL (Global Interpreter Lock) affect multi-threaded CPU-bound execution?",
                "options": [
                    "Allows true parallel multi-core execution for bytecode",
                    "Prevents multiple native threads from executing Python bytecodes at once",
                    "Only affects I/O-bound operations",
                    "Automatically compiles Python code to GPU instructions"
                ],
                "correct_index": 1,
                "topic": "Concurrency & Memory"
            },
            {
                "id": "py-4",
                "question": "What is the output of `[x**2 for x in range(5) if x % 2 == 0]`?",
                "options": [
                    "[0, 4, 16]",
                    "[1, 9]",
                    "[0, 1, 4, 9, 16]",
                    "[4, 16]"
                ],
                "correct_index": 0,
                "topic": "List Comprehensions"
            },
            {
                "id": "py-5",
                "question": "In Python's `asyncio`, what keyword is required before calling a coroutine function?",
                "options": [
                    "yield",
                    "await",
                    "defer",
                    "promise"
                ],
                "correct_index": 1,
                "topic": "Asynchronous Programming"
            }
        ]
    },
    "React": {
        "title": "React & Modern UI Architecture",
        "description": "Assess proficiency in React hooks, state management, memoization, lifecycle behaviors, and component patterns.",
        "duration_minutes": 15,
        "questions": [
            {
                "id": "rc-1",
                "question": "Which React hook should be used to cache expensive calculation results between re-renders?",
                "options": [
                    "useCallback",
                    "useMemo",
                    "useRef",
                    "useLayoutEffect"
                ],
                "correct_index": 1,
                "topic": "Performance & Memoization"
            },
            {
                "id": "rc-2",
                "question": "What happens if you update state inside a `useEffect` hook without specifying an appropriate dependency array?",
                "options": [
                    "The component compiles to static HTML",
                    "An infinite re-render loop will occur",
                    "React ignores the state update",
                    "The browser crashes with a syntax error"
                ],
                "correct_index": 1,
                "topic": "Effects & Dependencies"
            },
            {
                "id": "rc-3",
                "question": "How does React's Virtual DOM reconciliation algorithm optimize DOM updates?",
                "options": [
                    "Rebuilds the entire browser layout tree on every render",
                    "Diffs virtual DOM trees and computes minimal batch patches to real DOM",
                    "Transfers rendering to Web Workers exclusively",
                    "Bypasses JavaScript by compiling to WebAssembly directly"
                ],
                "correct_index": 1,
                "topic": "Reconciliation & Virtual DOM"
            },
            {
                "id": "rc-4",
                "question": "What is the primary difference between `useCallback` and `useMemo`?",
                "options": [
                    "`useCallback` caches a function definition, `useMemo` caches the return value of a function",
                    "`useCallback` is asynchronous while `useMemo` is synchronous",
                    "`useMemo` only runs on unmount",
                    "There is no functional difference"
                ],
                "correct_index": 0,
                "topic": "Hooks Architecture"
            },
            {
                "id": "rc-5",
                "question": "Why is the `key` prop required when rendering lists of elements in React?",
                "options": [
                    "For CSS styling selectors",
                    "To help React identify which items have changed, been added, or removed during diffing",
                    "To enable automatic indexing in search engines",
                    "To enforce TypeScript type safety"
                ],
                "correct_index": 1,
                "topic": "List Reconciliation"
            }
        ]
    },
    "SQL": {
        "title": "SQL, Schema Design & Indexing",
        "description": "Test SQL queries, JOINs, indexing mechanisms, normalization, ACID transactions, and query optimization.",
        "duration_minutes": 15,
        "questions": [
            {
                "id": "sql-1",
                "question": "Which SQL JOIN returns all records from the left table and matched records from the right table?",
                "options": [
                    "INNER JOIN",
                    "LEFT JOIN (or LEFT OUTER JOIN)",
                    "FULL OUTER JOIN",
                    "CROSS JOIN"
                ],
                "correct_index": 1,
                "topic": "Relational JOINs"
            },
            {
                "id": "sql-2",
                "question": "What is the purpose of creating a B-Tree index on a frequently queried column?",
                "options": [
                    "Reduces disk storage space",
                    "Speeds up data retrieval from O(N) to O(log N) at the cost of slight write overhead",
                    "Enforces non-null constraints automatically",
                    "Encrypts column data on disk"
                ],
                "correct_index": 1,
                "topic": "Indexing & Performance"
            },
            {
                "id": "sql-3",
                "question": "What does the 'I' stand for in the ACID transaction properties?",
                "options": [
                    "Indexation",
                    "Isolation",
                    "Iteration",
                    "Immutable"
                ],
                "correct_index": 1,
                "topic": "ACID Properties"
            },
            {
                "id": "sql-4",
                "question": "Which clause in SQL is used to filter results AFTER aggregate functions like `COUNT()` or `AVG()` are applied?",
                "options": [
                    "WHERE",
                    "HAVING",
                    "GROUP BY",
                    "ORDER BY"
                ],
                "correct_index": 1,
                "topic": "Aggregations & Filtering"
            },
            {
                "id": "sql-5",
                "question": "What is 3rd Normal Form (3NF) in database normalization?",
                "options": [
                    "Table has no duplicate columns",
                    "Table is in 2NF and has no transitive functional dependencies",
                    "Every row has a foreign key constraint",
                    "Data is distributed across 3 nodes"
                ],
                "correct_index": 1,
                "topic": "Database Normalization"
            }
        ]
    },
    "Cloud & DevOps": {
        "title": "Cloud Architecture, Docker & CI/CD",
        "description": "Assess containers, Dockerfiles, Kubernetes pods, microservices communication, and deployment pipelines.",
        "duration_minutes": 15,
        "questions": [
            {
                "id": "cd-1",
                "question": "What is the primary benefit of multi-stage Docker builds in containerization?",
                "options": [
                    "Enables multi-threading inside containers",
                    "Significantly reduces final image size by discarding build tools and intermediate artifacts",
                    "Automatically pushes images to Docker Hub",
                    "Encrypts container file systems"
                ],
                "correct_index": 1,
                "topic": "Container Optimization"
            },
            {
                "id": "cd-2",
                "question": "In Kubernetes, what is the smallest deployable computing unit you can create and manage?",
                "options": [
                    "Node",
                    "Cluster",
                    "Pod",
                    "Namespace"
                ],
                "correct_index": 2,
                "topic": "Kubernetes Architecture"
            },
            {
                "id": "cd-3",
                "question": "What is the key difference between Continuous Delivery and Continuous Deployment?",
                "options": [
                    "Continuous Delivery requires manual approval before release to production; Continuous Deployment deploys automatically",
                    "Continuous Delivery does not run automated tests",
                    "Continuous Deployment only works on local environments",
                    "There is no difference"
                ],
                "correct_index": 0,
                "topic": "CI/CD Strategies"
            },
            {
                "id": "cd-4",
                "question": "Which HTTP status code should a RESTful API return upon successful creation of a new resource?",
                "options": [
                    "200 OK",
                    "201 Created",
                    "204 No Content",
                    "301 Moved Permanently"
                ],
                "correct_index": 1,
                "topic": "REST Protocols"
            },
            {
                "id": "cd-5",
                "question": "What is Infrastructure as Code (IaC)?",
                "options": [
                    "Writing frontend CSS using Python",
                    "Managing and provisioning computing infrastructure through machine-readable definition files (e.g. Terraform)",
                    "Running virtual machines without operating systems",
                    "Compressing server hard drives"
                ],
                "correct_index": 1,
                "topic": "IaC Principles"
            }
        ]
    }
}

class SubmitAssessmentRequest(BaseModel):
    category: str
    answers: Dict[str, int] # question_id -> chosen option index

@router.get("/categories")
async def get_assessment_categories():
    categories = []
    for cat_name, data in ASSESSMENT_QUESTION_BANK.items():
        categories.append({
            "category": cat_name,
            "title": data["title"],
            "description": data["description"],
            "duration_minutes": data["duration_minutes"],
            "questions_count": len(data["questions"])
        })
    return {"categories": categories}

@router.get("/start/{category}")
async def start_assessment(category: str, current_user: dict = Depends(require_roles(["student"]))):
    bank = ASSESSMENT_QUESTION_BANK.get(category)
    if not bank:
        # Fallback to Python if not found
        for k in ASSESSMENT_QUESTION_BANK.keys():
            if k.lower() == category.lower():
                bank = ASSESSMENT_QUESTION_BANK[k]
                category = k
                break
    if not bank:
        raise HTTPException(status_code=404, detail=f"Assessment category '{category}' not found")

    # Sanitize questions so correct_index is NOT exposed to frontend
    sanitized_questions = []
    for q in bank["questions"]:
        sanitized_questions.append({
            "id": q["id"],
            "question": q["question"],
            "options": q["options"],
            "topic": q["topic"]
        })

    return {
        "category": category,
        "title": bank["title"],
        "description": bank["description"],
        "duration_minutes": bank["duration_minutes"],
        "questions": sanitized_questions
    }

@router.post("/submit")
async def submit_assessment(req: SubmitAssessmentRequest, current_user: dict = Depends(require_roles(["student"]))):
    user_id = current_user["_id"]
    category = req.category
    bank = ASSESSMENT_QUESTION_BANK.get(category)
    if not bank:
        for k in ASSESSMENT_QUESTION_BANK.keys():
            if k.lower() == category.lower():
                bank = ASSESSMENT_QUESTION_BANK[k]
                category = k
                break
    if not bank:
        raise HTTPException(status_code=404, detail="Invalid assessment category")

    questions = bank["questions"]
    total_q = len(questions)
    correct_count = 0
    strengths = []
    weaknesses = []

    for q in questions:
        q_id = q["id"]
        chosen_opt = req.answers.get(q_id)
        if chosen_opt is not None and chosen_opt == q["correct_index"]:
            correct_count += 1
            strengths.append(q["topic"])
        else:
            weaknesses.append(q["topic"])

    score_percentage = round((correct_count / max(total_q, 1)) * 100.0, 1)
    passed = score_percentage >= 60.0

    now = datetime.now(timezone.utc).isoformat()
    attempt_id = str(uuid.uuid4())

    attempt_doc = {
        "_id": attempt_id,
        "user_id": user_id,
        "category": category,
        "score_percentage": score_percentage,
        "correct_answers": correct_count,
        "total_questions": total_q,
        "passed": passed,
        "strengths": list(set(strengths)),
        "weaknesses": list(set(weaknesses)),
        "completed_at": now
    }

    attempts_col = get_assessment_attempts_col()
    await attempts_col.insert_one(attempt_doc)

    # Automatically update Student's Skill Passport with verified badge and score
    student_col = get_student_profiles_col()
    profile = await student_col.find_one({"user_id": user_id}) or {}
    skills = profile.get("skills", [])

    # Check if skill already exists in passport
    skill_found = False
    for s in skills:
        if s.get("name", "").strip().lower() == category.strip().lower():
            skill_found = True
            s["proficiency"] = max(float(s.get("proficiency", 0)), score_percentage)
            if passed:
                s["verified"] = True
                s["evidence_status"] = "verified"
                s["verified_at"] = now
                s["verification_source"] = f"SkillOrbit Assessment ({score_percentage}%)"
            break

    if not skill_found:
        skills.append({
            "id": str(uuid.uuid4()),
            "name": category,
            "proficiency": score_percentage,
            "category": "Technical",
            "verified": passed,
            "evidence_status": "verified" if passed else "self_declared",
            "verified_at": now if passed else None,
            "verification_source": f"SkillOrbit Assessment ({score_percentage}%)" if passed else None,
            "added_at": now
        })

    await student_col.update_one({"user_id": user_id}, {"$set": {"skills": skills, "updated_at": now}})

    # Send notification
    notif_col = get_notifications_col()
    await notif_col.insert_one({
        "user_id": user_id,
        "title": f"Assessment Completed: {category}",
        "message": f"You scored {score_percentage}% on the {category} assessment." + (" Verified badge awarded to your Skill Passport!" if passed else " Keep practicing to earn verification."),
        "type": "assessment",
        "action_url": "/student/skill-passport",
        "read": False,
        "created_at": now
    })

    return {
        "attempt_id": attempt_id,
        "category": category,
        "score_percentage": score_percentage,
        "correct_answers": correct_count,
        "total_questions": total_q,
        "passed": passed,
        "strengths": list(set(strengths)),
        "weaknesses": list(set(weaknesses)),
        "verified_badge_awarded": passed
    }
