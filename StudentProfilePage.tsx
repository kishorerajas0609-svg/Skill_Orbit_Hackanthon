import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { StudentProfile, ProjectItem, ExperienceItem, CertificateItem } from '../../types';
import {
  User,
  GraduationCap,
  Briefcase,
  Layers,
  Award,
  Plus,
  Trash2,
  ExternalLink,
  Camera,
  CheckCircle2,
  ShieldCheck,
  Edit,
  Save,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ImageCropperModal } from '../../components/ui/ImageCropperModal';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const StudentProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Modals
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState<ProjectItem>({
    id: '',
    title: '',
    description: '',
    technologies: [],
    role: '',
    github_url: '',
    live_url: '',
  });
  const [techInput, setTechInput] = useState('');

  const [showCertModal, setShowCertModal] = useState(false);
  const [certForm, setCertForm] = useState<CertificateItem>({
    id: '',
    title: '',
    issuer: '',
    issue_date: '2025-06',
    credential_url: '',
  });

  // Edit Mode state
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [personalData, setPersonalData] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
  });

  const [editingAcademic, setEditingAcademic] = useState(false);
  const [academicData, setAcademicData] = useState({
    institution_name: '',
    department: '',
    degree: '',
    current_year: 3,
    graduation_year: 2026,
    cgpa: 8.5,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/students/profile');
      const p = res.data?.profile;
      setProfile(p);
      if (p) {
        setPersonalData({
          full_name: p.full_name || '',
          phone: p.phone || '',
          location: p.location || '',
          bio: p.bio || '',
          linkedin_url: p.linkedin_url || '',
          github_url: p.github_url || '',
          portfolio_url: p.portfolio_url || '',
        });
        setAcademicData({
          institution_name: p.academic?.institution_name || '',
          department: p.academic?.department || '',
          degree: p.academic?.degree || '',
          current_year: p.academic?.current_year || 3,
          graduation_year: p.academic?.graduation_year || 2026,
          cgpa: p.academic?.cgpa || 8.0,
        });
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersonal = async () => {
    setSaving(true);
    try {
      await api.put('/students/personal', personalData);
      setEditingPersonal(false);
      setMessage('Personal details saved successfully');
      setTimeout(() => setMessage(''), 3000);
      await fetchProfile();
    } catch (e) {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAcademic = async () => {
    setSaving(true);
    try {
      await api.put('/students/academic', academicData);
      setEditingAcademic(false);
      setMessage('Academic information updated');
      setTimeout(() => setMessage(''), 3000);
      await fetchProfile();
    } catch (e) {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim()) return;

    try {
      await api.post('/students/projects', projectForm);
      setShowProjectModal(false);
      setProjectForm({ id: '', title: '', description: '', technologies: [], role: '', github_url: '', live_url: '' });
      setTechInput('');
      await fetchProfile();
    } catch (e) {
      // ignore
    }
  };

  const handleDeleteProject = async (pId: string) => {
    try {
      await api.delete(`/students/projects/${pId}`);
      await fetchProfile();
    } catch (e) {
      // ignore
    }
  };

  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.title.trim()) return;

    try {
      await api.post('/students/certificates', certForm);
      setShowCertModal(false);
      setCertForm({ id: '', title: '', issuer: '', issue_date: '2025-06', credential_url: '' });
      await fetchProfile();
    } catch (e) {
      // ignore
    }
  };

  const handleDeleteCertificate = async (cId: string) => {
    try {
      await api.delete(`/students/certificates/${cId}`);
      await fetchProfile();
    } catch (e) {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoadingSkeleton className="h-64 rounded-2xl" />
          <LoadingSkeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  const readiness = profile?.readiness?.overall_score || 0;
  const verifiedSkills = profile?.skills?.filter((s) => s.verified) || [];

  return (
    <div className="space-y-8">
      {message && (
        <div className="p-3 rounded-xl bg-emerald-500/10 text-xs text-emerald-400 border border-emerald-500/30 font-semibold animate-in fade-in">
          {message}
        </div>
      )}

      {/* Profile Header Banner */}
      <Card className="p-8 border-border bg-gradient-to-r from-surface via-surface-elevated to-surface relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          {/* Avatar & Edit Trigger */}
          <div className="relative group">
            <div className="h-24 w-24 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-2xl overflow-hidden shadow-lg">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
              ) : (
                profile?.full_name?.charAt(0).toUpperCase() || 'S'
              )}
            </div>
            <button
              onClick={() => setShowPhotoModal(true)}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-md border border-emerald-400/40 transition-transform hover:scale-105"
              title="Change Profile Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Details */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-foreground">{profile?.full_name}</h1>
              <Badge variant="emerald" size="sm">Student</Badge>
              <Badge variant="cyan" size="sm">{profile?.career_target?.dream_role || 'Target Role Set'}</Badge>
            </div>
            <p className="text-xs text-foreground-muted">
              {profile?.academic?.department || 'Engineering'} • {profile?.academic?.institution_name || 'Registered College'}
            </p>
            {profile?.bio && (
              <p className="text-xs text-foreground-muted/90 max-w-2xl leading-relaxed pt-1">
                "{profile.bio}"
              </p>
            )}
          </div>

          {/* Readiness gauge */}
          <div className="p-4 rounded-2xl bg-surface border border-border text-center shrink-0">
            <span className="text-xs font-bold text-foreground-muted block">Placement Score</span>
            <span className="text-3xl font-extrabold text-emerald-400">{readiness}%</span>
            <span className="block text-[10px] text-emerald-400 font-semibold">{profile?.readiness?.tier}</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal & Academic */}
        <div className="space-y-6 lg:col-span-1">
          {/* Personal Info Card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" /> Personal Details
              </h2>
              <button
                onClick={() => setEditingPersonal(!editingPersonal)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                {editingPersonal ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editingPersonal ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-foreground-muted">Full Name</label>
                  <input
                    type="text"
                    value={personalData.full_name}
                    onChange={(e) => setPersonalData({ ...personalData, full_name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-1.5 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-foreground-muted">Phone Number</label>
                  <input
                    type="text"
                    value={personalData.phone}
                    onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-1.5 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-foreground-muted">Location</label>
                  <input
                    type="text"
                    value={personalData.location}
                    onChange={(e) => setPersonalData({ ...personalData, location: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-1.5 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-foreground-muted">Bio</label>
                  <textarea
                    rows={2}
                    value={personalData.bio}
                    onChange={(e) => setPersonalData({ ...personalData, bio: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-1.5 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <Button size="sm" variant="primary" loading={saving} onClick={handleSavePersonal} className="w-full">
                  Save Personal Details
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-foreground-muted block text-[11px]">Email</span>
                  <span className="font-semibold text-foreground">{profile?.email}</span>
                </div>
                <div>
                  <span className="text-foreground-muted block text-[11px]">Phone</span>
                  <span className="font-semibold text-foreground">{profile?.phone || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-foreground-muted block text-[11px]">Location</span>
                  <span className="font-semibold text-foreground">{profile?.location || 'Not provided'}</span>
                </div>
                {profile?.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> GitHub Profile
                  </a>
                )}
                {profile?.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> LinkedIn Profile
                  </a>
                )}
              </div>
            )}
          </Card>

          {/* Academic Card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cyan-400" /> Academic Details
              </h2>
              <button
                onClick={() => setEditingAcademic(!editingAcademic)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                {editingAcademic ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editingAcademic ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-foreground-muted">College / Institution</label>
                  <input
                    type="text"
                    value={academicData.institution_name}
                    onChange={(e) => setAcademicData({ ...academicData, institution_name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-1.5 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-foreground-muted">Department</label>
                  <input
                    type="text"
                    value={academicData.department}
                    onChange={(e) => setAcademicData({ ...academicData, department: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-1.5 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-foreground-muted">Degree</label>
                    <input
                      type="text"
                      value={academicData.degree}
                      onChange={(e) => setAcademicData({ ...academicData, degree: e.target.value })}
                      className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-1.5 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-foreground-muted">CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      value={academicData.cgpa}
                      onChange={(e) => setAcademicData({ ...academicData, cgpa: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-1.5 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                <Button size="sm" variant="primary" loading={saving} onClick={handleSaveAcademic} className="w-full">
                  Save Academic Info
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-foreground-muted block text-[11px]">College</span>
                  <span className="font-semibold text-foreground">{profile?.academic?.institution_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-foreground-muted block text-[11px]">Department & Degree</span>
                  <span className="font-semibold text-foreground">
                    {profile?.academic?.degree} in {profile?.academic?.department}
                  </span>
                </div>
                <div className="flex justify-between">
                  <div>
                    <span className="text-foreground-muted block text-[11px]">Year & Batch</span>
                    <span className="font-semibold text-foreground">Year {profile?.academic?.current_year} ({profile?.academic?.graduation_year})</span>
                  </div>
                  <div>
                    <span className="text-foreground-muted block text-[11px]">CGPA</span>
                    <span className="font-bold text-emerald-400">{profile?.academic?.cgpa || '0.00'}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Projects, Verified Skills & Certificates */}
        <div className="space-y-6 lg:col-span-2">
          {/* Projects Portfolio */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-sm font-bold text-foreground">Project Portfolio</h2>
                <p className="text-xs text-foreground-muted">Add live systems and repositories proving your skills</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowProjectModal(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Add Project
              </Button>
            </div>

            {profile?.projects && profile.projects.length > 0 ? (
              <div className="space-y-3">
                {profile.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-xl border border-border bg-surface-elevated space-y-2 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-foreground">{proj.title}</h3>
                        <p className="text-xs text-foreground-muted mt-1 leading-relaxed">{proj.description}</p>
                      </div>
                      <button
                        onClick={() => proj.id && handleDeleteProject(proj.id)}
                        className="text-foreground-muted hover:text-rose-400 p-1"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.technologies?.map((tech, idx) => (
                        <Badge key={idx} variant="muted" size="sm">{tech}</Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 pt-2 text-xs">
                      {proj.github_url && (
                        <a
                          href={proj.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> GitHub Repo
                        </a>
                      )}
                      {proj.live_url && (
                        <a
                          href={proj.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-xl">
                <p className="text-xs text-foreground-muted">No projects added yet. Add a project to boost your placement score.</p>
              </div>
            )}
          </Card>

          {/* Certificates */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-sm font-bold text-foreground">Certifications & Credentials</h2>
                <p className="text-xs text-foreground-muted">Verified certifications attached to your profile</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowCertModal(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Add Certificate
              </Button>
            </div>

            {profile?.certificates && profile.certificates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-4 rounded-xl border border-border bg-surface-elevated space-y-2 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-foreground block">{cert.title}</span>
                        <span className="text-[10px] text-foreground-muted block">Issued by {cert.issuer} • {cert.issue_date}</span>
                      </div>
                      <button
                        onClick={() => cert.id && handleDeleteCertificate(cert.id)}
                        className="text-foreground-muted hover:text-rose-400 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {cert.credential_url && (
                      <a
                        href={cert.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 pt-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Verify Credential
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-border rounded-xl">
                <p className="text-xs text-foreground-muted">No external certificates added yet.</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Photo Upload Modal */}
      <ImageCropperModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onSuccess={(url) => {
          setProfile((prev: any) => ({ ...prev, avatar_url: url }));
          setMessage('Profile photo updated successfully!');
          setTimeout(() => setMessage(''), 3000);
        }}
      />

      {/* Add Project Modal */}
      <Modal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        title="Add Project to Portfolio"
        description="Share projects demonstrating your practical skills."
      >
        <form onSubmit={handleAddProject} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Project Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Task Orchestrator"
              value={projectForm.title}
              onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Description *</label>
            <textarea
              rows={3}
              required
              placeholder="Describe the problem solved, architecture, and impact..."
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Technologies Used (comma separated)</label>
            <input
              type="text"
              placeholder="React, TypeScript, FastAPI, PostgreSQL, Docker"
              value={techInput}
              onChange={(e) => {
                setTechInput(e.target.value);
                setProjectForm({
                  ...projectForm,
                  technologies: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                });
              }}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">GitHub URL</label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={projectForm.github_url}
                onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Live App URL</label>
              <input
                type="url"
                placeholder="https://app.vercel.app"
                value={projectForm.live_url}
                onChange={(e) => setProjectForm({ ...projectForm, live_url: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowProjectModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Certificate Modal */}
      <Modal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        title="Add Certification Credential"
        description="Attach verified external credentials."
      >
        <form onSubmit={handleAddCertificate} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Certificate Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. AWS Certified Solutions Architect"
              value={certForm.title}
              onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Issuing Organization *</label>
            <input
              type="text"
              required
              placeholder="e.g. Amazon Web Services / Coursera"
              value={certForm.issuer}
              onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Credential Verification Link</label>
            <input
              type="url"
              placeholder="https://..."
              value={certForm.credential_url}
              onChange={(e) => setCertForm({ ...certForm, credential_url: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowCertModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Certificate
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
