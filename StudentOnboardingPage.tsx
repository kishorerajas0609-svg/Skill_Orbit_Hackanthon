import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import {
  GraduationCap,
  Briefcase,
  Layers,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const StudentOnboardingPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [academic, setAcademic] = useState({
    institution_name: '',
    department: 'Computer Science & Engineering',
    degree: 'B.Tech',
    current_year: 3,
    graduation_year: 2026,
    cgpa: 8.5,
    enrollment_number: '',
  });

  const [career, setCareer] = useState({
    dream_role: 'Full Stack Developer',
    work_mode_preference: 'any',
    preferred_locations: ['Bengaluru', 'Hyderabad', 'Remote'],
  });

  const [skills, setSkills] = useState<Array<{ name: string; proficiency: number; category: string }>>([
    { name: 'Python', proficiency: 80, category: 'Technical' },
    { name: 'React', proficiency: 75, category: 'Technical' },
    { name: 'JavaScript', proficiency: 85, category: 'Technical' },
  ]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProf, setNewSkillProf] = useState(70);

  const [personal, setPersonal] = useState({
    phone: '',
    location: '',
    bio: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
  });

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    if (skills.some((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) return;
    setSkills([...skills, { name: newSkillName.trim(), proficiency: newSkillProf, category: 'Technical' }]);
    setNewSkillName('');
  };

  const removeSkill = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const handleFinish = async () => {
    if (!academic.institution_name) {
      setError('Please provide your institution/college name.');
      setStep(1);
      return;
    }
    setError('');
    setLoading(true);

    try {
      await api.post('/students/onboarding', {
        ...personal,
        ...academic,
        dream_role: career.dream_role,
        work_mode_preference: career.work_mode_preference,
        preferred_locations: career.preferred_locations,
        initial_skills: skills,
      });

      await refreshUser();
      navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* Progress Stepper Header */}
      <div className="mb-8 space-y-4 text-center">
        <Badge variant="emerald">Student Profile Setup</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          Let's Build Your Skill Passport
        </h1>
        <p className="text-xs sm:text-sm text-foreground-muted">
          Step {step} of 4 — Accurate profiles receive higher matching accuracy from verified recruiters.
        </p>

        {/* Stepper Dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[
            { num: 1, label: 'Academic', icon: GraduationCap },
            { num: 2, label: 'Career Target', icon: Briefcase },
            { num: 3, label: 'Skill Passport', icon: Layers },
            { num: 4, label: 'Links & Bio', icon: User },
          ].map((s) => {
            const Icon = s.icon;
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="flex items-center gap-2">
                <div
                  className={`flex h-8 items-center gap-1.5 px-3 rounded-full text-xs font-semibold border transition-all ${
                    isCurrent
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : isCompleted
                      ? 'bg-surface-elevated border-border text-emerald-400'
                      : 'bg-surface border-border text-foreground-muted opacity-50'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Icon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {s.num < 4 && <div className="h-0.5 w-4 bg-border" />}
              </div>
            );
          })}
        </div>
      </div>

      <Card className="p-8 shadow-2xl border-border bg-surface">
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 text-xs text-rose-400 border border-rose-500/30">
            {error}
          </div>
        )}

        {/* Step 1: Academic */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-foreground">Academic Information</h3>
            
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Institution / College Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Indian Institute of Information Technology"
                value={academic.institution_name}
                onChange={(e) => setAcademic({ ...academic, institution_name: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground">Department / Stream</label>
                <select
                  value={academic.department}
                  onChange={(e) => setAcademic({ ...academic, department: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                >
                  <option>Computer Science & Engineering</option>
                  <option>Information Technology</option>
                  <option>Electronics & Communication</option>
                  <option>Data Science & AI</option>
                  <option>Electrical Engineering</option>
                  <option>Mechanical Engineering</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground">Degree / Program</label>
                <select
                  value={academic.degree}
                  onChange={(e) => setAcademic({ ...academic, degree: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                >
                  <option>B.Tech</option>
                  <option>B.E.</option>
                  <option>M.Tech</option>
                  <option>MCA</option>
                  <option>B.Sc Computer Science</option>
                  <option>BCA</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground">Current Year</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={academic.current_year}
                  onChange={(e) => setAcademic({ ...academic, current_year: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground">Graduation Year</label>
                <input
                  type="number"
                  min="2024"
                  max="2030"
                  value={academic.graduation_year}
                  onChange={(e) => setAcademic({ ...academic, graduation_year: parseInt(e.target.value) || 2026 })}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground">CGPA / Score</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={academic.cgpa}
                  onChange={(e) => setAcademic({ ...academic, cgpa: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Career Target */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-foreground">Career Goals & Preferences</h3>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Dream Job / Target Role *</label>
              <select
                value={career.dream_role}
                onChange={(e) => setCareer({ ...career, dream_role: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
              >
                <option>Full Stack Developer</option>
                <option>Frontend Engineer</option>
                <option>Backend Engineer</option>
                <option>Data Scientist</option>
                <option>AI / Machine Learning Engineer</option>
                <option>Cloud & DevOps Engineer</option>
                <option>Cybersecurity Analyst</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Work Mode Preference</label>
              <div className="grid grid-cols-4 gap-2">
                {['any', 'onsite', 'remote', 'hybrid'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setCareer({ ...career, work_mode_preference: mode })}
                    className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-colors ${
                      career.work_mode_preference === mode
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-surface-elevated border-border text-foreground-muted'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Skill Passport */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Initial Skill Passport</h3>
              <Badge variant="cyan">{skills.length} skills listed</Badge>
            </div>
            <p className="text-xs text-foreground-muted">
              Add skills you currently know. You can take timed assessments later to earn verified badges.
            </p>

            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Skill name (e.g. Docker, TypeScript, SQL)"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addSkill} icon={<Plus className="w-4 h-4" />}>
                Add Skill
              </Button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {skills.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface-elevated"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-foreground">{s.name}</span>
                    <span className="block text-[10px] text-foreground-muted">Self-declared • {s.proficiency}% proficiency</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSkill(idx)}
                    className="p-1 text-foreground-muted hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Links & Bio */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-foreground">Portfolio Links & About</h3>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Short Bio</label>
              <textarea
                rows={3}
                placeholder="Passionate software engineer with hands-on experience building scalable applications..."
                value={personal.bio}
                onChange={(e) => setPersonal({ ...personal, bio: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground">GitHub Profile URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={personal.github_url}
                  onChange={(e) => setPersonal({ ...personal, github_url: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground">LinkedIn Profile URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={personal.linkedin_url}
                  onChange={(e) => setPersonal({ ...personal, linkedin_url: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-border mt-6">
          {step > 1 ? (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setStep(step - 1)}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : <div />}

          {step < 4 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setStep(step + 1)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              loading={loading}
              onClick={handleFinish}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Complete Setup & Open Dashboard
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
