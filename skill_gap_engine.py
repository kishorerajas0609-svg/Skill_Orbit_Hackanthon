from typing import Any, Dict, List

ROLE_BENCHMARKS = {
    "Full Stack Developer": [
        {"name": "JavaScript", "required_proficiency": 85, "category": "Frontend", "importance": "Critical"},
        {"name": "React", "required_proficiency": 80, "category": "Frontend", "importance": "Critical"},
        {"name": "Node.js", "required_proficiency": 75, "category": "Backend", "importance": "Critical"},
        {"name": "Python", "required_proficiency": 70, "category": "Backend", "importance": "High"},
        {"name": "SQL & Databases", "required_proficiency": 75, "category": "Database", "importance": "Critical"},
        {"name": "REST APIs", "required_proficiency": 85, "category": "Backend", "importance": "Critical"},
        {"name": "Git & Version Control", "required_proficiency": 80, "category": "DevOps", "importance": "High"},
        {"name": "Docker & Containers", "required_proficiency": 65, "category": "DevOps", "importance": "Medium"},
    ],
    "Data Scientist": [
        {"name": "Python", "required_proficiency": 90, "category": "Programming", "importance": "Critical"},
        {"name": "SQL & Databases", "required_proficiency": 80, "category": "Data", "importance": "Critical"},
        {"name": "Pandas & Data Manipulation", "required_proficiency": 85, "category": "Data Analysis", "importance": "Critical"},
        {"name": "Machine Learning (Scikit-Learn)", "required_proficiency": 80, "category": "AI/ML", "importance": "Critical"},
        {"name": "Deep Learning (PyTorch/TensorFlow)", "required_proficiency": 70, "category": "AI/ML", "importance": "High"},
        {"name": "Data Visualization (Tableau/Power BI)", "required_proficiency": 75, "category": "Visualization", "importance": "High"},
        {"name": "Statistics & Probability", "required_proficiency": 85, "category": "Mathematics", "importance": "Critical"},
    ],
    "AI / Machine Learning Engineer": [
        {"name": "Python", "required_proficiency": 90, "category": "Programming", "importance": "Critical"},
        {"name": "Deep Learning (PyTorch)", "required_proficiency": 85, "category": "AI/ML", "importance": "Critical"},
        {"name": "Transformers & LLMs", "required_proficiency": 80, "category": "AI/ML", "importance": "Critical"},
        {"name": "Model Optimization & MLOps", "required_proficiency": 75, "category": "MLOps", "importance": "High"},
        {"name": "Docker & Kubernetes", "required_proficiency": 70, "category": "Infrastructure", "importance": "High"},
        {"name": "Vector Databases & RAG", "required_proficiency": 75, "category": "AI/ML", "importance": "High"},
        {"name": "Math & Linear Algebra", "required_proficiency": 85, "category": "Mathematics", "importance": "Critical"},
    ],
    "Cloud & DevOps Engineer": [
        {"name": "Linux Administration", "required_proficiency": 85, "category": "Operating Systems", "importance": "Critical"},
        {"name": "Docker & Containers", "required_proficiency": 85, "category": "DevOps", "importance": "Critical"},
        {"name": "Kubernetes", "required_proficiency": 80, "category": "Orchestration", "importance": "Critical"},
        {"name": "AWS / Azure Cloud", "required_proficiency": 80, "category": "Cloud", "importance": "Critical"},
        {"name": "Terraform / IaC", "required_proficiency": 75, "category": "IaC", "importance": "High"},
        {"name": "CI/CD Pipelines", "required_proficiency": 85, "category": "DevOps", "importance": "Critical"},
        {"name": "Python / Bash Scripting", "required_proficiency": 75, "category": "Scripting", "importance": "High"},
    ],
    "Backend Engineer": [
        {"name": "Python", "required_proficiency": 85, "category": "Backend", "importance": "Critical"},
        {"name": "SQL & Databases", "required_proficiency": 85, "category": "Databases", "importance": "Critical"},
        {"name": "FastAPI / Django", "required_proficiency": 80, "category": "Frameworks", "importance": "Critical"},
        {"name": "System Design & Architecture", "required_proficiency": 80, "category": "Architecture", "importance": "Critical"},
        {"name": "Redis & Caching", "required_proficiency": 75, "category": "Performance", "importance": "High"},
        {"name": "Kafka / Message Queues", "required_proficiency": 70, "category": "Distributed Systems", "importance": "High"},
        {"name": "Docker & Microservices", "required_proficiency": 75, "category": "DevOps", "importance": "High"},
    ],
    "Frontend Engineer": [
        {"name": "JavaScript", "required_proficiency": 90, "category": "Core Web", "importance": "Critical"},
        {"name": "TypeScript", "required_proficiency": 85, "category": "Core Web", "importance": "Critical"},
        {"name": "React", "required_proficiency": 85, "category": "Frameworks", "importance": "Critical"},
        {"name": "CSS / Tailwind CSS", "required_proficiency": 85, "category": "Styling", "importance": "Critical"},
        {"name": "Web Performance & SEO", "required_proficiency": 75, "category": "Performance", "importance": "High"},
        {"name": "Next.js", "required_proficiency": 75, "category": "Frameworks", "importance": "High"},
        {"name": "REST & GraphQL Integration", "required_proficiency": 80, "category": "Integration", "importance": "High"},
    ],
    "Cybersecurity Analyst": [
        {"name": "Network Security & Protocols", "required_proficiency": 85, "category": "Networks", "importance": "Critical"},
        {"name": "Linux & Bash", "required_proficiency": 80, "category": "Systems", "importance": "Critical"},
        {"name": "Vulnerability Assessment & Pen Testing", "required_proficiency": 80, "category": "Security", "importance": "Critical"},
        {"name": "SIEM & Log Analysis", "required_proficiency": 75, "category": "Monitoring", "importance": "High"},
        {"name": "Cryptography Basics", "required_proficiency": 75, "category": "Theory", "importance": "High"},
        {"name": "Python for Security", "required_proficiency": 70, "category": "Scripting", "importance": "High"},
    ]
}

def analyze_skill_gaps(target_role: str, student_skills: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes deterministic skill gaps against industry target roles.
    """
    # Match closest target role benchmarks or fallback to general Full Stack
    benchmarks = ROLE_BENCHMARKS.get(target_role)
    if not benchmarks:
        # Search case-insensitively
        for role_key, reqs in ROLE_BENCHMARKS.items():
            if role_key.lower() in target_role.lower() or target_role.lower() in role_key.lower():
                benchmarks = reqs
                target_role = role_key
                break
    if not benchmarks:
        benchmarks = ROLE_BENCHMARKS["Full Stack Developer"]
        target_role = "Full Stack Developer"

    # Map student skills
    student_map = {}
    for s in student_skills:
        name = s.get("name", "").strip().lower()
        if name:
            student_map[name] = {
                "name": s.get("name"),
                "proficiency": float(s.get("proficiency", 0)),
                "verified": bool(s.get("verified", False)),
                "evidence_status": s.get("evidence_status", "self_declared")
            }

    skills_analysis = []
    total_required_pts = 0
    total_acquired_pts = 0
    strong_count = 0
    weak_count = 0
    missing_count = 0

    for bench in benchmarks:
        req_name = bench["name"]
        req_prof = bench["required_proficiency"]
        key = req_name.strip().lower()

        # Check direct or partial match
        matched_stu = None
        for stu_key, stu_val in student_map.items():
            if stu_key == key or stu_key in key or key in stu_key:
                matched_stu = stu_val
                break

        total_required_pts += req_prof

        if matched_stu:
            curr_prof = matched_stu["proficiency"]
            is_verified = matched_stu["verified"]
            total_acquired_pts += min(curr_prof, req_prof)

            gap = round(max(0.0, req_prof - curr_prof), 1)
            if curr_prof >= req_prof:
                status = "Strong"
                strong_count += 1
                rec_action = "Maintain mastery & build advanced portfolio showcases or mentor others."
            else:
                status = "Needs Improvement"
                weak_count += 1
                rec_action = f"Improve proficiency by {gap}% through practical project milestones and verified assessments."

            skills_analysis.append({
                "skill": req_name,
                "category": bench["category"],
                "importance": bench["importance"],
                "required_proficiency": req_prof,
                "current_proficiency": curr_prof,
                "gap": gap,
                "status": status,
                "verified": is_verified,
                "recommended_action": rec_action
            })
        else:
            missing_count += 1
            skills_analysis.append({
                "skill": req_name,
                "category": bench["category"],
                "importance": bench["importance"],
                "required_proficiency": req_prof,
                "current_proficiency": 0,
                "gap": req_prof,
                "status": "Missing",
                "verified": False,
                "recommended_action": f"Start foundational courses, complete interactive assessments, and build initial project."
            })

    readiness_percentage = round((total_acquired_pts / max(total_required_pts, 1)) * 100.0, 1)

    return {
        "target_role": target_role,
        "readiness_percentage": readiness_percentage,
        "total_skills_evaluated": len(benchmarks),
        "strong_skills_count": strong_count,
        "weak_skills_count": weak_count,
        "missing_skills_count": missing_count,
        "skills": skills_analysis
    }
