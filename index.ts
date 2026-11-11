export type UserRole = 'student' | 'recruiter' | 'institution' | 'academician' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  is_verified?: boolean;
  is_onboarded: boolean;
  theme?: 'dark' | 'light' | 'system';
  has_password?: boolean;
  status?: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface SkillItem {
  id: string;
  name: string;
  category?: string;
  proficiency: number;
  verified: boolean;
  evidence_status: 'self_declared' | 'evidence_submitted' | 'verified';
  evidence_url?: string;
  evidence_type?: string;
  verified_at?: string;
  verification_source?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  role?: string;
  github_url?: string;
  live_url?: string;
  start_date?: string;
  end_date?: string;
}

export interface ExperienceItem {
  id: string;
  company_name: string;
  role_title: string;
  work_type?: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  description: string;
  skills_used?: string[];
}

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  credential_id?: string;
  credential_url?: string;
  issue_date: string;
  expiry_date?: string;
  document_url?: string;
  status?: string;
}

export interface AcademicDetails {
  institution_name?: string;
  department?: string;
  degree?: string;
  current_year?: number;
  graduation_year?: number;
  cgpa?: number;
  enrollment_number?: string;
}

export interface PlacementReadiness {
  overall_score: number;
  academic_completeness: number;
  skill_passport_score: number;
  project_portfolio_score: number;
  assessment_score: number;
  tier: string;
}

export interface StudentProfile {
  _id?: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  academic?: AcademicDetails;
  career_target?: {
    dream_role?: string;
    secondary_role?: string;
  };
  career_preferences?: {
    dream_role?: string;
    work_mode_preference?: string;
    preferred_locations?: string[];
  };
  skills: SkillItem[];
  projects: ProjectItem[];
  experience: ExperienceItem[];
  certificates: CertificateItem[];
  readiness?: PlacementReadiness;
  visibility?: {
    profile?: string;
    recruiter_view?: boolean;
  };
}

export interface RecruiterProfile {
  _id?: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  company_name: string;
  company_website?: string;
  company_logo_url?: string;
  industry?: string;
  company_size?: string;
  headquarters?: string;
  cin_or_reg_number?: string;
  description?: string;
  position_title?: string;
  department?: string;
  verification_status: 'unverified' | 'pending_verification' | 'verified' | 'rejected';
  hiring_roles?: string[];
  preferred_streams?: string[];
}

export interface InstitutionProfile {
  _id?: string;
  user_id: string;
  institution_name: string;
  aishe_code?: string;
  university_affiliation?: string;
  institution_type?: string;
  website?: string;
  logo_url?: string;
  address?: string;
  city?: string;
  state?: string;
  placement_officer_name?: string;
  placement_officer_email?: string;
  placement_officer_phone?: string;
  departments?: string[];
  degrees_offered?: string[];
}

export interface AcademicianProfile {
  _id?: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  institution_name?: string;
  department?: string;
  designation?: string;
  qualifications?: string;
  research_interests?: string[];
  courses_taught?: string[];
  industry_experience_years?: number;
  mentorship_available?: boolean;
  bio?: string;
  publications?: any[];
}

export interface MatchBreakdown {
  overall_match: number;
  breakdown: {
    skills_score: number;
    eligibility_score: number;
    preference_score: number;
    experience_score: number;
  };
  matching_skills: Array<{
    skill: string;
    required_level: number;
    student_level: number;
    verified: boolean;
    status: string;
  }>;
  weak_skills: Array<{
    skill: string;
    required_level: number;
    student_level: number;
    gap: number;
    verified: boolean;
    status: string;
  }>;
  missing_skills: Array<{
    skill: string;
    required_level: number;
    student_level: number;
    gap: number;
    status: string;
  }>;
  eligibility_notes: string[];
}

export interface Opportunity {
  _id: string;
  creator_id: string;
  title: string;
  type: 'internship' | 'full_time' | 'contract' | 'apprenticeship';
  company_name: string;
  company_logo_url?: string;
  description: string;
  responsibilities?: string[];
  required_skills: Array<{ name: string; min_proficiency: number }>;
  preferred_skills?: Array<{ name: string }>;
  eligible_departments?: string[];
  eligible_degrees?: string[];
  eligible_graduation_years?: number[];
  min_cgpa?: number;
  openings: number;
  location: string;
  work_mode: 'onsite' | 'remote' | 'hybrid';
  duration_months?: number;
  stipend_or_salary: string;
  application_deadline: string;
  joining_date?: string;
  selection_stages?: string[];
  benefits?: string[];
  status: 'active' | 'closed';
  applicants_count?: number;
  created_at: string;
  match_score?: number;
  match_breakdown?: MatchBreakdown;
  has_applied?: boolean;
  application_status?: string;
}

export interface Application {
  _id: string;
  opportunity_id: string;
  opportunity_title: string;
  company_name: string;
  company_logo_url?: string;
  opportunity_type: string;
  recruiter_id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_avatar?: string;
  cover_note?: string;
  resume_url?: string;
  match_score_at_apply: number;
  match_breakdown?: MatchBreakdown;
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Assessment' | 'Interview' | 'Selected' | 'Rejected' | 'Offer Accepted' | 'Offer Declined' | 'Withdrawn';
  timeline: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  applied_at: string;
  student_profile?: Partial<StudentProfile>;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  topic: string;
}

export interface AssessmentCategory {
  category: string;
  title: string;
  description: string;
  duration_minutes: number;
  questions_count: number;
}

export interface AssessmentResult {
  attempt_id: string;
  category: string;
  score_percentage: number;
  correct_answers: number;
  total_questions: number;
  passed: boolean;
  strengths: string[];
  weaknesses: string[];
  verified_badge_awarded: boolean;
}

export interface RoadmapMilestone {
  phase: number;
  title: string;
  timeline: string;
  description: string;
  skills_to_learn: string[];
  action_items: Array<{
    title: string;
    type: 'course' | 'project' | 'assessment';
  }>;
  deliverable: string;
}

export interface CareerRoadmap {
  _id?: string;
  user_id: string;
  target_role: string;
  readiness_at_generation: number;
  explanation: string;
  phases: RoadmapMilestone[];
  progress_state?: Record<string, boolean>;
}

export interface NotificationItem {
  _id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  action_url?: string;
  read: boolean;
  created_at: string;
}

export interface ChatSession {
  _id: string;
  user_id: string;
  role: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  _id: string;
  session_id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
