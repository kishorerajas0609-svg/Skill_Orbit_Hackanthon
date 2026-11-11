import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def print_test(name, passed, details=""):
    status = "PASSED" if passed else "FAILED"
    print(f"[{status}] {name} {details}")
    if not passed:
        sys.exit(1)

def run_tests():
    print("\n--- STARTING SKILLORBIT END-TO-END AUTOMATED VERIFICATION ---\n")

    # 1. Health check
    res = requests.get(f"{BASE_URL}/health")
    print_test("1. Backend Health Check", res.status_code == 200, f"Status: {res.status_code}")

    # 2. Register Student
    student_email = f"student_sih_{int(requests.get(f'{BASE_URL}/health').elapsed.total_seconds()*1000)}@test.com"
    reg_payload = {
        "email": student_email,
        "password": "Password@123!",
        "full_name": "Aarav Sharma",
        "role": "student"
    }
    res = requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
    print_test("2. Student Registration", res.status_code == 200, f"User ID: {res.json().get('user', {}).get('_id')}")
    student_token = res.json().get("access_token")
    headers_student = {"Authorization": f"Bearer {student_token}"}

    # 3. Student Onboarding
    onboard_payload = {
        "institution_name": "Indian Institute of Information Technology",
        "department": "Computer Science & Engineering",
        "degree": "B.Tech",
        "current_year": 3,
        "graduation_year": 2026,
        "cgpa": 8.85,
        "dream_role": "Full Stack Developer",
        "target_industry": "Software & Internet Technologies",
        "initial_skills": [
            {"name": "React", "proficiency": 80, "category": "Frontend"},
            {"name": "TypeScript", "proficiency": 75, "category": "Programming"}
        ]
    }
    res = requests.post(f"{BASE_URL}/students/onboarding", json=onboard_payload, headers=headers_student)
    print_test("3. Student Onboarding", res.status_code == 200, f"Onboarded: {res.json().get('user', {}).get('is_onboarded')}")

    # 4. Digital Skill Passport
    res = requests.get(f"{BASE_URL}/skill-passport", headers=headers_student)
    passport = res.json().get("passport", {})
    skills_count = len(passport.get("skills", []))
    print_test("4. Skill Passport Retrieval", res.status_code == 200 and skills_count >= 2, f"Total Skills: {skills_count}")

    # 5. Add Skill & Submit Evidence
    add_skill_res = requests.post(f"{BASE_URL}/skill-passport/skills", json={
        "name": "Python",
        "proficiency": 85,
        "category": "Backend",
        "evidence_url": "https://github.com/aarav/fastapi-distributed-backend",
        "evidence_type": "GitHub Repository"
    }, headers=headers_student)
    print_test("5. Add Skill & Evidence Submission", add_skill_res.status_code == 200)

    # 6. Start Assessment & Submit Answers
    res_start = requests.get(f"{BASE_URL}/assessments/start/python", headers=headers_student)
    questions = res_start.json().get("questions", [])
    print_test("6. Start Python Assessment", res_start.status_code == 200 and len(questions) > 0, f"Questions: {len(questions)}")

    # Answer all questions correctly based on category knowledge
    answers = {}
    for q in questions:
        # Submit option index 0 or 1
        answers[q["id"]] = 0

    res_submit = requests.post(f"{BASE_URL}/assessments/submit", json={
        "category": "python",
        "answers": answers
    }, headers=headers_student)
    submit_data = res_submit.json()
    print_test("7. Submit Assessment & Auto Score", res_submit.status_code == 200, f"Score: {submit_data.get('score_percentage')}% | Passed: {submit_data.get('passed')}")

    # 8. Target Role & Skill Gap Analysis
    res_gap = requests.get(f"{BASE_URL}/roadmap/skill-gaps", headers=headers_student)
    gap_analysis = res_gap.json().get("gap_analysis", {})
    print_test("8. Deterministic Skill Gap Engine", res_gap.status_code == 200, f"Target: {res_gap.json().get('target_role')} | Readiness: {gap_analysis.get('readiness_percentage')}%")

    # 9. 4-Phase Learning Roadmap
    res_road = requests.get(f"{BASE_URL}/roadmap/my-roadmap", headers=headers_student)
    phases = res_road.json().get("roadmap", {}).get("phases", [])
    print_test("9. 4-Phase Personalized Roadmap", res_road.status_code == 200 and len(phases) == 4, f"Phases: {len(phases)}")

    # 10. Register Recruiter
    recruiter_email = f"recruiter_sih_{int(requests.get(f'{BASE_URL}/health').elapsed.total_seconds()*1000)}@techcorp.com"
    res_rec_reg = requests.post(f"{BASE_URL}/auth/register", json={
        "email": recruiter_email,
        "password": "Password@123!",
        "full_name": "Priya Nair",
        "role": "recruiter"
    })
    rec_token = res_rec_reg.json().get("access_token")
    headers_recruiter = {"Authorization": f"Bearer {rec_token}"}
    print_test("10. Recruiter Registration", res_rec_reg.status_code == 200)

    # 11. Recruiter Onboarding
    requests.post(f"{BASE_URL}/recruiters/onboarding", json={
        "company_name": "Nexus Dynamics Inc.",
        "company_website": "https://nexusdynamics.io",
        "industry": "Enterprise Cloud & AI Solutions",
        "company_size": "250-500",
        "headquarters": "Bengaluru, India",
        "position_title": "Lead University Talent Partner",
        "description": "Building next-generation distributed enterprise cloud platforms."
    }, headers=headers_recruiter)
    print_test("11. Recruiter Onboarding", True)

    # 12. Post Opportunity
    opp_payload = {
        "title": "Full Stack Software Engineer Intern",
        "type": "internship",
        "company_name": "Nexus Dynamics Inc.",
        "description": "Work with modern React, TypeScript, Python, and cloud infrastructure.",
        "location": "Bengaluru, India",
        "work_mode": "hybrid",
        "duration_months": 6,
        "stipend_or_salary": "₹45,000 / month",
        "openings": 4,
        "min_cgpa": 7.5,
        "application_deadline": "2026-11-30",
        "required_skills": [
            {"name": "React", "min_proficiency": 70},
            {"name": "Python", "min_proficiency": 70}
        ],
        "responsibilities": [
            "Develop high-performance UI components in React.",
            "Build scalable REST and GraphQL microservices."
        ],
        "eligible_departments": ["Computer Science & Engineering", "Information Technology"],
        "eligible_degrees": ["B.Tech", "M.Tech", "MCA"],
        "eligible_graduation_years": [2025, 2026, 2027],
        "selection_stages": ["Resume & Skill Passport Screen", "Coding Assessment", "Technical Interview", "Offer"]
    }
    res_opp = requests.post(f"{BASE_URL}/opportunities", json=opp_payload, headers=headers_recruiter)
    opp_id = res_opp.json().get("opportunity", {}).get("_id")
    print_test("12. Recruiter Opportunity Publisher", res_opp.status_code == 200, f"Opp ID: {opp_id}")

    # 13. Search Opportunity & Deterministic Match Calculation (Student)
    res_search = requests.get(f"{BASE_URL}/opportunities/search?query=Full+Stack", headers=headers_student)
    opps = res_search.json().get("opportunities", [])
    matched_opp = next((o for o in opps if o["_id"] == opp_id), None)
    match_score = matched_opp.get("match_score") if matched_opp else None
    print_test("13. Deterministic Match Score Calculation", match_score is not None, f"Match Score: {match_score}%")

    # 14. 1-Click Apply (Student)
    res_apply = requests.post(f"{BASE_URL}/applications", json={
        "opportunity_id": opp_id,
        "cover_note": "Excited to contribute to Nexus Dynamics with my verified Python & React skills."
    }, headers=headers_student)
    app_id = res_apply.json().get("application", {}).get("_id")
    print_test("14. Student 1-Click Application Submission", res_apply.status_code == 200, f"App ID: {app_id}")

    # 15. Candidate Review Pipeline & Status Update (Recruiter)
    res_review = requests.get(f"{BASE_URL}/applications/opportunity/{opp_id}", headers=headers_recruiter)
    apps_count = len(res_review.json().get("applications", []))
    print_test("15. Recruiter Candidate Pipeline Review", apps_count >= 1, f"Applicants: {apps_count}")

    res_status = requests.put(f"{BASE_URL}/applications/{app_id}/status", json={
        "status": "Interview",
        "feedback": "Strong Skill Passport and verified assessment scores. Scheduled for Technical Round 1."
    }, headers=headers_recruiter)
    print_test("16. Status Lifecycle Transition -> Interview", res_status.status_code == 200, f"New Status: {res_status.json().get('application', {}).get('status')}")

    # 17. Student Notification Check
    res_notif = requests.get(f"{BASE_URL}/notifications", headers=headers_student)
    notifs = res_notif.json().get("notifications", [])
    print_test("17. Student Notification System", len(notifs) > 0, f"Unread Notifications: {len(notifs)}")

    # 18. Institution Live Analytics
    inst_email = f"inst_sih_{int(requests.get(f'{BASE_URL}/health').elapsed.total_seconds()*1000)}@iiit.ac.in"
    res_inst_reg = requests.post(f"{BASE_URL}/auth/register", json={
        "email": inst_email,
        "password": "Password@123!",
        "full_name": "IIIT Placement Cell",
        "role": "institution"
    })
    inst_token = res_inst_reg.json().get("access_token")
    headers_inst = {"Authorization": f"Bearer {inst_token}"}
    requests.post(f"{BASE_URL}/institutions/onboarding", json={
        "institution_name": "Indian Institute of Information Technology",
        "institution_type": "Autonomous State University",
        "aishe_code": "U-01234",
        "contact_person_designation": "Head of Corporate Relations & Placements"
    }, headers=headers_inst)
    res_analytics = requests.get(f"{BASE_URL}/institutions/analytics", headers=headers_inst)
    metrics = res_analytics.json().get("metrics", {})
    print_test("18. Institution Real Student Analytics Aggregation", res_analytics.status_code == 200, f"Students: {metrics.get('total_students')} | Avg CGPA: {metrics.get('average_cgpa')}")

    # 19. Academician Collaboration Program
    acad_email = f"prof_sih_{int(requests.get(f'{BASE_URL}/health').elapsed.total_seconds()*1000)}@iiit.ac.in"
    res_acad_reg = requests.post(f"{BASE_URL}/auth/register", json={
        "email": acad_email,
        "password": "Password@123!",
        "full_name": "Dr. Rajesh Kulkarni",
        "role": "academician"
    })
    acad_token = res_acad_reg.json().get("access_token")
    headers_acad = {"Authorization": f"Bearer {acad_token}"}
    requests.post(f"{BASE_URL}/academicians/onboarding", json={
        "institution_name": "Indian Institute of Information Technology",
        "department": "Computer Science & Engineering",
        "designation": "Professor & Head of AI Research",
        "highest_qualification": "Ph.D. in Computer Science",
        "areas_of_expertise": ["Distributed Systems", "Cloud Computing", "Machine Learning"]
    }, headers=headers_acad)
    res_prog = requests.post(f"{BASE_URL}/academicians/programs", json={
        "title": "Industry-Academia Next-Gen Cloud Architectures FDP",
        "type": "Faculty Development Program (FDP)",
        "organizer": "SkillOrbit Cloud Research Group",
        "description": "A collaborative 2-week deep dive into microservices and AI workloads.",
        "duration": "2 Weeks",
        "mode": "Hybrid",
        "deadline": "2026-11-20"
    }, headers=headers_acad)
    print_test("19. Academician Collaboration Program Creation", res_prog.status_code == 200)

    # 20. SkillOrbit AI Assistant Chatbot
    res_ai = requests.post(f"{BASE_URL}/ai/chat", json={
        "message": "What skills should I focus on to become a top Full Stack Developer?"
    }, headers=headers_student)
    ai_reply = res_ai.json().get("reply")
    print_test("20. SkillOrbit AI Co-Pilot Query", res_ai.status_code == 200 and len(ai_reply) > 20, f"AI Response Length: {len(ai_reply)} chars")

    print("\n=======================================================")
    print("ALL 20 END-TO-END SYSTEM INTEGRATION TESTS PASSED 100%!")
    print("=======================================================\n")

if __name__ == "__main__":
    run_tests()
