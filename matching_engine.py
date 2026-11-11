from typing import Any, Dict, List

def calculate_student_job_match(student_profile: Dict[str, Any], opportunity: Dict[str, Any]) -> Dict[str, Any]:
    """
    Deterministic Student-Job Matching Engine.
    
    Weights:
    - Required Skills Overlap & Proficiency: 45%
    - Academic Eligibility (CGPA, Course, Dept, Year): 25%
    - Work Mode & Location Preference: 15%
    - Projects & Portfolio Relevance: 15%
    """
    # 1. Skills Evaluation
    required_skills = opportunity.get("required_skills", []) or []
    preferred_skills = opportunity.get("preferred_skills", []) or []
    
    student_skills = student_profile.get("skills", []) or []
    # Build lookup map: { skill_name.lower(): { proficiency, verified } }
    skill_map = {}
    for s in student_skills:
        name = s.get("name", "").strip().lower()
        if name:
            skill_map[name] = {
                "name": s.get("name"),
                "proficiency": float(s.get("proficiency", 50)),
                "verified": bool(s.get("verified", False))
            }
            
    matching_skills = []
    missing_skills = []
    weak_skills = []
    
    total_skill_points = 0.0
    max_skill_points = max(len(required_skills) * 100.0, 100.0)
    
    for req in required_skills:
        req_name = req.get("name", "") if isinstance(req, dict) else str(req)
        req_min_prof = float(req.get("min_proficiency", 60)) if isinstance(req, dict) else 60.0
        
        req_key = req_name.strip().lower()
        if req_key in skill_map:
            stu_skill = skill_map[req_key]
            prof = stu_skill["proficiency"]
            is_verified = stu_skill["verified"]
            
            # Base proficiency credit
            pts = min(prof, 100.0)
            # 10% bonus for verified skill
            if is_verified:
                pts = min(pts * 1.1, 100.0)
                
            total_skill_points += pts
            
            if prof >= req_min_prof:
                matching_skills.append({
                    "skill": stu_skill["name"],
                    "required_level": req_min_prof,
                    "student_level": prof,
                    "verified": is_verified,
                    "status": "Strong" if prof >= req_min_prof + 15 else "Adequate"
                })
            else:
                weak_skills.append({
                    "skill": stu_skill["name"],
                    "required_level": req_min_prof,
                    "student_level": prof,
                    "gap": round(req_min_prof - prof, 1),
                    "verified": is_verified,
                    "status": "Needs Improvement"
                })
        else:
            missing_skills.append({
                "skill": req_name,
                "required_level": req_min_prof,
                "student_level": 0,
                "gap": req_min_prof,
                "status": "Missing"
            })
            
    # Preferred skills provide bonus
    for pref in preferred_skills:
        pref_name = pref.get("name", "") if isinstance(pref, dict) else str(pref)
        pref_key = pref_name.strip().lower()
        if pref_key in skill_map:
            total_skill_points += 15.0  # Bonus points
            matching_skills.append({
                "skill": skill_map[pref_key]["name"],
                "required_level": 0,
                "student_level": skill_map[pref_key]["proficiency"],
                "verified": skill_map[pref_key]["verified"],
                "status": "Preferred Bonus"
            })
            
    skills_score = min(round((total_skill_points / max_skill_points) * 100.0, 1), 100.0)
    
    # 2. Academic Eligibility Evaluation
    academic = student_profile.get("academic", {}) or {}
    student_cgpa = float(academic.get("cgpa", 0.0) or 0.0)
    student_dept = str(academic.get("department", "")).strip().lower()
    student_degree = str(academic.get("degree", "")).strip().lower()
    student_grad_year = int(academic.get("graduation_year", 0) or 0)
    
    min_cgpa = float(opportunity.get("min_cgpa", 0.0) or 0.0)
    eligible_departments = [d.strip().lower() for d in opportunity.get("eligible_departments", []) if d]
    eligible_degrees = [d.strip().lower() for d in opportunity.get("eligible_degrees", []) if d]
    eligible_grad_years = opportunity.get("eligible_graduation_years", []) or []
    
    eligibility_points = 100.0
    eligibility_notes = []
    
    # Check CGPA
    if min_cgpa > 0:
        if student_cgpa >= min_cgpa:
            eligibility_notes.append(f"CGPA {student_cgpa} meets requirement of {min_cgpa}")
        else:
            eligibility_points -= 35.0
            eligibility_notes.append(f"CGPA {student_cgpa} below threshold of {min_cgpa}")
            
    # Check Department
    if eligible_departments:
        if any(dept in student_dept or student_dept in dept for dept in eligible_departments):
            eligibility_notes.append(f"Department '{academic.get('department')}' matches criteria")
        else:
            eligibility_points -= 30.0
            eligibility_notes.append(f"Department '{academic.get('department')}' not in preferred list")
            
    # Check Graduation Year
    if eligible_grad_years and student_grad_year > 0:
        if student_grad_year in eligible_grad_years:
            eligibility_notes.append(f"Graduation cohort {student_grad_year} matches")
        else:
            eligibility_points -= 20.0
            
    eligibility_score = max(round(eligibility_points, 1), 0.0)
    
    # 3. Preference Match (Work Mode, Location)
    pref = student_profile.get("career_preferences", {}) or {}
    stu_work_mode = str(pref.get("work_mode_preference", "any")).strip().lower()
    opp_work_mode = str(opportunity.get("work_mode", "onsite")).strip().lower()
    
    stu_locations = [loc.strip().lower() for loc in pref.get("preferred_locations", []) if loc]
    opp_location = str(opportunity.get("location", "")).strip().lower()
    
    pref_score = 100.0
    if stu_work_mode != "any" and opp_work_mode != "any" and stu_work_mode != opp_work_mode:
        pref_score -= 30.0
    if opp_work_mode == "onsite" and stu_locations:
        if not any(loc in opp_location for loc in stu_locations):
            pref_score -= 25.0
    pref_score = max(round(pref_score, 1), 20.0)
    
    # 4. Project & Experience Relevance
    projects = student_profile.get("projects", []) or []
    experience = student_profile.get("experience", []) or []
    
    relevance_points = 50.0  # Base credit
    if projects:
        relevance_points += min(len(projects) * 15.0, 30.0)
    if experience:
        relevance_points += min(len(experience) * 20.0, 20.0)
        
    experience_score = min(round(relevance_points, 1), 100.0)
    
    # Overall Weighted Match Score
    overall_match = round(
        (skills_score * 0.45) +
        (eligibility_score * 0.25) +
        (pref_score * 0.15) +
        (experience_score * 0.15),
        1
    )
    
    return {
        "overall_match": overall_match,
        "breakdown": {
            "skills_score": skills_score,
            "eligibility_score": eligibility_score,
            "preference_score": pref_score,
            "experience_score": experience_score,
        },
        "matching_skills": matching_skills,
        "weak_skills": weak_skills,
        "missing_skills": missing_skills,
        "eligibility_notes": eligibility_notes
    }
