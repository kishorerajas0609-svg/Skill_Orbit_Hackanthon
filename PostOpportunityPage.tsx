import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import {
  Briefcase,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Building2,
  DollarSign,
  GraduationCap
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const PostOpportunityPage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    type: 'internship',
    company_name: '',
    description: '',
    location: 'Bengaluru, India',
    work_mode: 'hybrid',
    duration_months: 6,
    stipend_or_salary: '₹35,000 / month',
    openings: 3,
    min_cgpa: 7.5,
    application_deadline: '2026-10-30',
  });

  const [requiredSkills, setRequiredSkills] = useState<Array<{ name: string; min_proficiency: number }>>([
    { name: 'React', min_proficiency: 75 },
    { name: 'TypeScript', min_proficiency: 70 },
  ]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillMinProf, setNewSkillMinProf] = useState(70);

  const [responsibilities, setResponsibilities] = useState<string[]>([
    'Design and build scalable frontend features using modern React architectures.',
    'Collaborate with backend engineers to integrate RESTful and WebSocket endpoints.',
    'Participate in agile sprint planning and technical design reviews.'
  ]);
  const [newResp, setNewResp] = useState('');

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    setRequiredSkills([...requiredSkills, { name: newSkillName.trim(), min_proficiency: newSkillMinProf }]);
    setNewSkillName('');
  };

  const removeSkill = (idx: number) => {
    setRequiredSkills(requiredSkills.filter((_, i) => i !== idx));
  };

  const addResp = () => {
    if (!newResp.trim()) return;
    setResponsibilities([...responsibilities, newResp.trim()]);
    setNewResp('');
  };

  const removeResp = (idx: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== idx));
  };

  // Call Gemini backend to generate JD content
  const handleAIAssist = async () => {
    if (!form.title.trim()) {
      setError('Please provide a role title first (e.g. Full Stack Developer, Data Analyst).');
      return;
    }
    setGeneratingAI(true);
    setError('');

    try {
      const res = await api.post('/ai/generate-jd', {
        title: form.title,
        department: 'Engineering',
        skills: requiredSkills.map((s) => s.name),
        experience_level: form.type === 'internship' ? 'Entry Level Internship' : 'Associate Full-Time',
      });

      const jd = res.data?.job_description;
      if (jd) {
        setForm((prev) => ({
          ...prev,
          description: jd.overview || prev.description,
        }));
        if (jd.responsibilities?.length) {
          setResponsibilities(jd.responsibilities);
        }
      }
    } catch (e) {
      // ignore
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || requiredSkills.length === 0) {
      setError('Please fill in the title and at least one required skill.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await api.post('/opportunities', {
        ...form,
        required_skills: requiredSkills,
        responsibilities,
        eligible_departments: ['Computer Science & Engineering', 'Information Technology', 'Data Science & AI'],
        eligible_degrees: ['B.Tech', 'B.E.', 'MCA', 'M.Tech'],
        eligible_graduation_years: [2025, 2026, 2027],
      });

      navigate('/recruiter/manage-opportunities');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to publish opportunity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      <div className="space-y-2 border-b border-border pb-6">
        <Badge variant="cyan">Opportunity Publisher</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          Publish Job or Internship Opportunity
        </h1>
        <p className="text-xs sm:text-sm text-foreground-muted">
          Our deterministic matching engine will automatically score student Skill Passports against these requirements.
        </p>
      </div>

      <Card className="p-8 shadow-2xl border-border bg-surface">
        {error && <div className="mb-6 p-3 rounded-xl bg-rose-500/10 text-xs text-rose-400 border border-rose-500/30">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-foreground">Job / Opportunity Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Full Stack Engineer (React + Node.js)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Opportunity Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
              >
                <option value="internship">Internship</option>
                <option value="full_time">Full-Time Job</option>
                <option value="apprenticeship">Apprenticeship</option>
                <option value="contract">Contract / Project</option>
              </select>
            </div>
          </div>

          {/* AI Generator Helper Button */}
          <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-foreground">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Use <strong>SkillOrbit AI</strong> to draft description & responsibilities automatically</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={generatingAI}
              onClick={handleAIAssist}
              icon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
            >
              Generate with Gemini
            </Button>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Role Overview & Description *</label>
            <textarea
              rows={4}
              required
              placeholder="Provide a comprehensive summary of the project, role, and requirements..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Required Skills Matrix */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
                Required Technical Skills (Used for Match Engine)
              </label>
              <Badge variant="cyan" size="sm">{requiredSkills.length} skills added</Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Skill name (e.g. React, Python, Docker)"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-foreground-muted">Min Prof: {newSkillMinProf}%</span>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={newSkillMinProf}
                  onChange={(e) => setNewSkillMinProf(parseInt(e.target.value))}
                  className="w-24 accent-cyan-500"
                />
                <Button type="button" variant="secondary" size="sm" onClick={addSkill} icon={<Plus className="w-4 h-4" />}>
                  Add
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {requiredSkills.map((sk, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-elevated border border-border text-xs text-foreground"
                >
                  <span className="font-semibold">{sk.name}</span>
                  <span className="text-[10px] text-cyan-400">({sk.min_proficiency}%+)</span>
                  <button type="button" onClick={() => removeSkill(idx)} className="text-foreground-muted hover:text-rose-400 ml-1">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Responsibilities list */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
              Key Responsibilities
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a key responsibility..."
                value={newResp}
                onChange={(e) => setNewResp(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addResp())}
                className="flex-1 rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addResp} icon={<Plus className="w-4 h-4" />}>
                Add
              </Button>
            </div>

            <ul className="space-y-1.5 max-h-40 overflow-y-auto">
              {responsibilities.map((r, i) => (
                <li key={i} className="flex items-center justify-between p-2 rounded-lg bg-surface-elevated text-xs text-foreground">
                  <span>• {r}</span>
                  <button type="button" onClick={() => removeResp(i)} className="text-foreground-muted hover:text-rose-400 p-0.5">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Compensation, Location, Work Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Stipend / Salary</label>
              <input
                type="text"
                value={form.stipend_or_salary}
                onChange={(e) => setForm({ ...form, stipend_or_salary: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Work Mode</label>
              <select
                value={form.work_mode}
                onChange={(e) => setForm({ ...form, work_mode: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
              >
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>
          </div>

          {/* CGPA, Openings, Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Min CGPA Threshold</label>
              <input
                type="number"
                step="0.1"
                value={form.min_cgpa}
                onChange={(e) => setForm({ ...form, min_cgpa: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Openings Count</label>
              <input
                type="number"
                min="1"
                value={form.openings}
                onChange={(e) => setForm({ ...form, openings: parseInt(e.target.value) || 1 })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Application Deadline</label>
              <input
                type="date"
                value={form.application_deadline}
                onChange={(e) => setForm({ ...form, application_deadline: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-6"
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Publish Opportunity to SkillOrbit
          </Button>
        </form>
      </Card>
    </div>
  );
};
