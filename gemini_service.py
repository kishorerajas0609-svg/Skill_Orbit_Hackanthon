import json
from typing import Any, Dict, List, Optional
import httpx
from config import settings

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = "gemini-1.5-flash"

    async def _call_gemini(self, prompt: str, system_instruction: Optional[str] = None, json_mode: bool = False) -> str:
        if not self.api_key:
            return ""

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        
        payload: Dict[str, Any] = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.3 if json_mode else 0.7,
                "maxOutputTokens": 2048,
            }
        }
        
        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }
            
        if json_mode:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        return content
                else:
                    print(f"Gemini API returned status {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"Gemini API request error: {e}")
            
        return ""

    async def chat_with_assistant(self, role: str, messages: List[Dict[str, str]], user_context: Dict[str, Any] = None) -> str:
        system_instruction = f"""
You are SkillOrbit AI, the intelligent career and academic co-pilot on SkillOrbit — the modern Academia-Industry Collaboration Platform.
The user is currently logged in with the role: '{role.upper()}'.

Role-Specific Guidelines:
- If Student: Provide actionable career guidance, explain skill gaps, recommend high-impact projects, provide interview tips, and help prepare for placements.
- If Recruiter: Help craft high-converting job descriptions, suggest screening questions, analyze candidate skill relevance, and provide recruitment market insights.
- If Institution / College: Provide insights on student placement readiness, department skill strengths, syllabus-to-industry alignment, and recruiter outreach strategies.
- If Academician / Faculty: Suggest Faculty Development Programs (FDPs), industry consultancy opportunities, research collaborations, and mentorship frameworks.
- If Admin: Provide operational insights, platform moderation tips, and system guidance.

Tone: Professional, inspiring, direct, structured with markdown formatting, bullet points, and actionable takeaways.
Do not make definitive hiring or firing decisions. Keep user private information safe.
"""
        # Format recent history
        prompt_parts = []
        if user_context:
            prompt_parts.append(f"Current User Context:\n{json.dumps(user_context, indent=2)}\n")
        
        prompt_parts.append("Conversation History:")
        for msg in messages[-8:]: # keep last 8 messages for context window
            sender = "User" if msg.get("role") == "user" else "Assistant"
            prompt_parts.append(f"{sender}: {msg.get('content')}")
            
        prompt = "\n".join(prompt_parts) + "\nAssistant:"

        response = await self._call_gemini(prompt, system_instruction=system_instruction)
        if response:
            return response

        # Intelligent Fallback if API key not set
        last_msg = messages[-1].get("content", "").lower() if messages else ""
        if "skill" in last_msg or "gap" in last_msg:
            return f"As your SkillOrbit AI advisor for **{role.title()}**, I recommend reviewing your Skill Passport to identify critical missing proficiencies. Focus on completing verified assessments and building evidence-backed projects to increase your placement readiness score."
        elif "interview" in last_msg:
            return "To prepare for technical interviews on SkillOrbit:\n1. Review the required skills in target job postings.\n2. Practice coding fundamentals and data structures.\n3. Prepare STAR method stories for your verified projects.\n4. Take our timed assessments to build confidence under real test conditions."
        elif "job" in last_msg or "internship" in last_msg:
            return "You can discover top matching opportunities in the **Explore Opportunities** tab. Our deterministic matching engine calculates transparent alignment scores based on your verified skills, academic criteria, and career preferences."
        else:
            return f"Hello! I am your **SkillOrbit AI Co-Pilot**. As a **{role.title()}**, how can I assist your career, talent search, or academic collaboration goals today?"

    async def explain_skill_gap(self, target_role: str, gap_data: Dict[str, Any]) -> str:
        prompt = f"""
Analyze the following skill gap data for a student aspiring to become a '{target_role}':
{json.dumps(gap_data, indent=2)}

Provide a concise, motivating, and structured analysis (3-4 short paragraphs):
1. **Overview & Current Strengths**: Highlight what they've already mastered.
2. **Critical Priority Gaps**: Focus on the top 2-3 missing or weak skills and explain why industry recruiters prioritize them.
3. **Recommended Immediate Action**: 2-3 practical steps (projects, assessments, hands-on practice) to close the gap fast.
"""
        system_instruction = "You are a senior tech career strategist and hiring director. Give sharp, actionable career advice."
        res = await self._call_gemini(prompt, system_instruction=system_instruction)
        if res:
            return res
        
        # Heuristic fallback
        weak = [s["skill"] for s in gap_data.get("skills", []) if s.get("status") == "Needs Improvement"]
        missing = [s["skill"] for s in gap_data.get("skills", []) if s.get("status") == "Missing"]
        return f"""### Career Readiness Analysis for {target_role}

**Current Standing**: You have achieved a baseline readiness of **{gap_data.get('readiness_percentage', 0)}%**. Your foundation provides a great springboard, but targeting specific industry-standard proficiencies will significantly boost your recruiter match rate.

**Key Gaps to Target**:
- **Critical Missing Skills**: {', '.join(missing[:3]) if missing else 'None'}
- **Skills to Strengthen**: {', '.join(weak[:3]) if weak else 'Core advanced topics'}

**Recommended Next Steps**:
1. Take verified SkillOrbit assessments in {missing[0] if missing else 'key technologies'} to add proof to your Skill Passport.
2. Build a full-stack end-to-end portfolio project demonstrating these technologies in production.
3. Apply to entry-level internships with matching scores above 75%."""

    async def generate_career_roadmap(self, target_role: str, gap_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        prompt = f"""
Generate a 4-phase actionable learning roadmap for a student targeting the role '{target_role}'.
Skill Gap Data:
{json.dumps(gap_data, indent=2)}

Return a valid JSON array of 4 milestone objects with this exact structure:
[
  {{
    "phase": 1,
    "title": "Phase Title",
    "timeline": "Weeks 1-3",
    "description": "Short explanation",
    "skills_to_learn": ["Skill A", "Skill B"],
    "action_items": [
      {{"title": "Task 1", "type": "course|project|assessment"}},
      {{"title": "Task 2", "type": "course|project|assessment"}}
    ],
    "deliverable": "Tangible output (e.g. deployed project or certification)"
  }}
]
"""
        system_instruction = "You are an expert technical curriculum designer. Output ONLY valid JSON."
        res = await self._call_gemini(prompt, system_instruction=system_instruction, json_mode=True)
        if res:
            try:
                data = json.loads(res)
                if isinstance(data, list):
                    return data
                elif isinstance(data, dict) and "phases" in data:
                    return data["phases"]
            except Exception:
                pass

        # High quality fallback roadmap
        missing = [s["skill"] for s in gap_data.get("skills", []) if s.get("status") in ["Missing", "Needs Improvement"]]
        s1 = missing[0] if len(missing) > 0 else "Core Architecture"
        s2 = missing[1] if len(missing) > 1 else "Database Design"
        s3 = missing[2] if len(missing) > 2 else "Cloud & Deployment"
        s4 = missing[3] if len(missing) > 3 else "System Optimization"

        return [
            {
                "phase": 1,
                "title": f"Foundational Mastery: {s1}",
                "timeline": "Weeks 1-3",
                "description": f"Master core syntax, design patterns, and fundamental concepts of {s1}.",
                "skills_to_learn": [s1, "Problem Solving"],
                "action_items": [
                    {"title": f"Complete hands-on tutorials and exercises in {s1}", "type": "course"},
                    {"title": f"Take SkillOrbit {s1} Verified Assessment", "type": "assessment"}
                ],
                "deliverable": f"Verified badge in {s1} on your Skill Passport"
            },
            {
                "phase": 2,
                "title": f"Intermediate Applications: {s2}",
                "timeline": "Weeks 4-6",
                "description": f"Integrate {s2} with real-world schemas, APIs, and business logic.",
                "skills_to_learn": [s2, "RESTful Architecture"],
                "action_items": [
                    {"title": f"Build a data-driven prototype using {s1} and {s2}", "type": "project"},
                    {"title": "Submit project link for peer & mentor verification", "type": "assessment"}
                ],
                "deliverable": "Working GitHub repository with clean documentation"
            },
            {
                "phase": 3,
                "title": f"Production Readiness & Cloud: {s3}",
                "timeline": "Weeks 7-9",
                "description": f"Implement CI/CD, containerization, and cloud deployment for {s3}.",
                "skills_to_learn": [s3, "Docker", "Testing"],
                "action_items": [
                    {"title": "Deploy project to cloud platform with automated pipeline", "type": "project"},
                    {"title": "Implement unit and integration tests", "type": "course"}
                ],
                "deliverable": "Live hosted web application link in your portfolio"
            },
            {
                "phase": 4,
                "title": f"Career Target Polish: {target_role}",
                "timeline": "Weeks 10-12",
                "description": f"Prepare for hiring cycles with mock interviews and resume optimization for {target_role}.",
                "skills_to_learn": [s4, "System Design", "Behavioral"],
                "action_items": [
                    {"title": "Conduct AI Mock Technical Interview on SkillOrbit", "type": "assessment"},
                    {"title": "Apply to curated high-match internships & jobs", "type": "project"}
                ],
                "deliverable": "Complete placement readiness score > 85%"
            }
        ]

    async def analyze_resume_and_profile(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
Evaluate the following student profile for tech industry placement readiness:
{json.dumps(profile, indent=2)}

Return a valid JSON object with:
{{
  "overall_score": 85,
  "summary": "2-3 sentences evaluation",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "areas_for_improvement": ["Area 1", "Area 2", "Area 3"],
  "recommended_keywords": ["Keyword 1", "Keyword 2", "Keyword 3"],
  "high_impact_project_ideas": [
    {{"title": "Project Title", "tech_stack": "Tech", "why_it_matters": "Reason"}}
  ]
}}
"""
        system_instruction = "You are a technical recruitment director. Return ONLY valid JSON."
        res = await self._call_gemini(prompt, system_instruction=system_instruction, json_mode=True)
        if res:
            try:
                return json.loads(res)
            except Exception:
                pass

        # Heuristic fallback
        skills_count = len(profile.get("skills", []))
        projects_count = len(profile.get("projects", []))
        score = min(40 + (skills_count * 5) + (projects_count * 15), 95)
        
        return {
            "overall_score": score,
            "summary": "Your profile demonstrates a solid academic base. Adding verified assessments and quantifiable project outcomes will maximize your visibility to top recruiters.",
            "strengths": [
                "Good technical skill breadth",
                "Demonstrated initiative in project building",
                "Clear academic trajectory"
            ],
            "areas_for_improvement": [
                "Quantify results in project descriptions (e.g. 'reduced load time by 30%')",
                "Verify skills with assessments to get verified badges",
                "Add live deployment links alongside GitHub repository URLs"
            ],
            "recommended_keywords": ["Microservices", "RESTful APIs", "Full-Stack Development", "Agile/Scrum", "CI/CD"],
            "high_impact_project_ideas": [
                {
                    "title": "Real-time Collaborative Workspace",
                    "tech_stack": "React, WebSockets, Node.js, Redis",
                    "why_it_matters": "Shows mastery of asynchronous event-driven architectures and state synchronization."
                },
                {
                    "title": "AI Document Parsing & Search Platform",
                    "tech_stack": "Python, FastAPI, Vector DB, Gemini API",
                    "why_it_matters": "Demonstrates modern Generative AI pipeline implementation skills."
                }
            ]
        }

    async def generate_job_description(self, title: str, department: str, skills: List[str], experience_level: str) -> Dict[str, Any]:
        prompt = f"""
Generate a compelling job description for:
Title: {title}
Department: {department}
Required Skills: {', '.join(skills)}
Experience Level: {experience_level}

Return a valid JSON object with:
{{
  "overview": "Company and role summary paragraph",
  "responsibilities": ["Resp 1", "Resp 2", "Resp 3", "Resp 4"],
  "requirements": ["Req 1", "Req 2", "Req 3", "Req 4"],
  "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
  "screening_tips": "Advice on what to look for in candidates"
}}
"""
        res = await self._call_gemini(prompt, system_instruction="You are an expert tech recruiter. Return ONLY valid JSON.", json_mode=True)
        if res:
            try:
                return json.loads(res)
            except Exception:
                pass

        return {
            "overview": f"We are seeking an ambitious and talented {title} to join our high-performing {department} team. You will build cutting-edge solutions, collaborate across engineering teams, and deliver impactful features.",
            "responsibilities": [
                f"Design, develop, and maintain robust applications using {', '.join(skills[:3])}.",
                "Write clean, testable, and efficient code following modern engineering standards.",
                "Participate in agile sprint planning, code reviews, and architectural discussions.",
                "Troubleshoot, debug, and upgrade existing production systems."
            ],
            "requirements": [
                f"Solid hands-on proficiency in {', '.join(skills)}.",
                f"Relevant education in Computer Science, Engineering, or related technical fields.",
                "Understanding of data structures, algorithms, and RESTful APIs.",
                "Strong analytical thinking, problem-solving, and communication skills."
            ],
            "benefits": [
                "Competitive compensation & performance bonuses",
                "Flexible work environment with modern tooling",
                "Mentorship programs and continuous learning support",
                "Rapid career advancement opportunities"
            ],
            "screening_tips": "Look for verified SkillPassport assessments and live GitHub/deployed project links."
        }

gemini_service = GeminiService()
