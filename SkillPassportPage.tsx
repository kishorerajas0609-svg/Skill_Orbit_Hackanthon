import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { SkillItem } from '../../types';
import {
  Layers,
  ShieldCheck,
  Award,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  FileCheck,
  CheckCircle2,
  Clock,
  Filter
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const SkillPassportPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [passport, setPassport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'evidence_submitted' | 'self_declared'>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 75, category: 'Technical', evidence_url: '', evidence_type: 'GitHub Project' });
  const [adding, setAdding] = useState(false);

  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedSkillForEvidence, setSelectedSkillForEvidence] = useState<SkillItem | null>(null);
  const [evidenceForm, setEvidenceForm] = useState({ evidence_url: '', evidence_type: 'GitHub Project', notes: '' });
  const [submittingEvidence, setSubmittingEvidence] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    fetchPassport();
  }, []);

  const fetchPassport = async () => {
    try {
      const res = await api.get('/skill-passport');
      setPassport(res.data?.passport);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;
    setAdding(true);
    setError('');

    try {
      await api.post('/skill-passport/skills', newSkill);
      setShowAddModal(false);
      setNewSkill({ name: '', proficiency: 75, category: 'Technical', evidence_url: '', evidence_type: 'GitHub Project' });
      await fetchPassport();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add skill.');
    } finally {
      setAdding(false);
    }
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillForEvidence || !evidenceForm.evidence_url) return;
    setSubmittingEvidence(true);

    try {
      await api.post('/skill-passport/evidence', {
        skill_id: selectedSkillForEvidence.id,
        evidence_url: evidenceForm.evidence_url,
        evidence_type: evidenceForm.evidence_type,
        notes: evidenceForm.notes,
      });
      setShowEvidenceModal(false);
      setSelectedSkillForEvidence(null);
      setEvidenceForm({ evidence_url: '', evidence_type: 'GitHub Project', notes: '' });
      await fetchPassport();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit evidence.');
    } finally {
      setSubmittingEvidence(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      await api.delete(`/skill-passport/skills/${skillId}`);
      await fetchPassport();
    } catch (e) {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <LoadingSkeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const allSkills: SkillItem[] = passport?.skills || [];
  const verifiedSkills: SkillItem[] = passport?.verified_skills || [];
  const evidenceSkills: SkillItem[] = passport?.evidence_submitted_skills || [];
  const selfDeclaredSkills: SkillItem[] = passport?.self_declared_skills || [];

  const displaySkills =
    activeTab === 'verified'
      ? verifiedSkills
      : activeTab === 'evidence_submitted'
      ? evidenceSkills
      : activeTab === 'self_declared'
      ? selfDeclaredSkills
      : allSkills;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-foreground">Digital Skill Passport</h1>
            <Badge variant="emerald" size="sm">Verifiable Credential</Badge>
          </div>
          <p className="mt-1 text-xs text-foreground-muted">
            Recruiters distinguish verified skills backed by assessments and evidence from self-declared claims.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Skill
          </Button>
          <Link to="/student/assessments">
            <Button variant="secondary" size="sm" icon={<Award className="w-4 h-4 text-emerald-400" />}>
              Verify with Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          onClick={() => setActiveTab('verified')}
          className={`p-5 cursor-pointer border transition-all ${
            activeTab === 'verified' ? 'border-emerald-500 bg-emerald-500/10' : 'hover:border-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Verified Skills</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-extrabold text-emerald-400 block mt-2">{verifiedSkills.length}</span>
          <span className="text-[11px] text-foreground-muted">Backed by SkillOrbit assessment tests</span>
        </Card>

        <Card
          onClick={() => setActiveTab('evidence_submitted')}
          className={`p-5 cursor-pointer border transition-all ${
            activeTab === 'evidence_submitted' ? 'border-cyan-500 bg-cyan-500/10' : 'hover:border-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Evidence Submitted</span>
            <FileCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-3xl font-extrabold text-cyan-400 block mt-2">{evidenceSkills.length}</span>
          <span className="text-[11px] text-foreground-muted">Projects, repos & certificates attached</span>
        </Card>

        <Card
          onClick={() => setActiveTab('self_declared')}
          className={`p-5 cursor-pointer border transition-all ${
            activeTab === 'self_declared' ? 'border-amber-500 bg-amber-500/10' : 'hover:border-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Self-Declared</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-extrabold text-amber-400 block mt-2">{selfDeclaredSkills.length}</span>
          <span className="text-[11px] text-foreground-muted">Unverified initial profile skills</span>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        {[
          { key: 'all', label: `All Skills (${allSkills.length})` },
          { key: 'verified', label: `Verified (${verifiedSkills.length})` },
          { key: 'evidence_submitted', label: `Evidence Submitted (${evidenceSkills.length})` },
          { key: 'self_declared', label: `Self-Declared (${selfDeclaredSkills.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-surface-elevated text-emerald-400 border border-emerald-500/30'
                : 'text-foreground-muted hover:text-foreground hover:bg-surface-elevated/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Skills Matrix Grid */}
      {displaySkills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displaySkills.map((skill) => {
            const isVerified = skill.verified || skill.evidence_status === 'verified';
            const hasEvidence = skill.evidence_status === 'evidence_submitted';

            return (
              <Card key={skill.id} hover className="p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{skill.name}</h3>
                      <span className="text-[10px] text-foreground-muted">{skill.category || 'Technical'}</span>
                    </div>

                    {isVerified ? (
                      <Badge variant="emerald" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                        Verified
                      </Badge>
                    ) : hasEvidence ? (
                      <Badge variant="cyan" size="sm" icon={<FileCheck className="w-3 h-3" />}>
                        Evidence
                      </Badge>
                    ) : (
                      <Badge variant="muted" size="sm">
                        Self-Declared
                      </Badge>
                    )}
                  </div>

                  {/* Proficiency Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-foreground-muted">Proficiency</span>
                      <span className="font-bold text-foreground">{skill.proficiency}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface-elevated overflow-hidden border border-border">
                      <div
                        className={`h-full rounded-full ${
                          isVerified
                            ? 'bg-emerald-500'
                            : hasEvidence
                            ? 'bg-cyan-500'
                            : 'bg-amber-500/80'
                        }`}
                        style={{ width: `${skill.proficiency}%` }}
                      />
                    </div>
                  </div>

                  {/* Verification or Evidence notes */}
                  {skill.verification_source && (
                    <div className="rounded-lg bg-emerald-500/5 p-2 border border-emerald-500/20 text-[10px] text-emerald-400">
                      ✓ Verified: {skill.verification_source}
                    </div>
                  )}

                  {skill.evidence_url && (
                    <a
                      href={skill.evidence_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      <ExternalLink className="w-3 h-3" /> View Submitted Evidence ({skill.evidence_type || 'Link'})
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  {!isVerified && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedSkillForEvidence(skill);
                          setShowEvidenceModal(true);
                        }}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        Submit Evidence
                      </button>
                      <span className="text-foreground-muted/40">•</span>
                      <Link
                        to="/student/assessments"
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                      >
                        Take Test
                      </Link>
                    </div>
                  )}
                  {isVerified && <div />}

                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="text-foreground-muted hover:text-rose-400 p-1 transition-colors"
                    title="Remove skill"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Layers className="w-6 h-6" />}
          title="No skills found in this category"
          description="Complete your skill assessment or add technical proficiencies to build a complete Skill Passport."
          actionText="Add a Skill to Passport"
          onAction={() => setShowAddModal(true)}
        />
      )}

      {/* Add Skill Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Skill to Digital Passport"
        description="Add a technical or soft skill with your estimated baseline proficiency."
      >
        <form onSubmit={handleAddSkill} className="space-y-4">
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Skill Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Docker, PostgreSQL, React, GraphQL"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Category</label>
            <select
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
            >
              <option>Technical</option>
              <option>Programming Language</option>
              <option>Framework & Library</option>
              <option>Database & Cloud</option>
              <option>Soft Skill</option>
            </select>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-foreground">
              <span>Proficiency Level</span>
              <span className="font-bold text-emerald-400">{newSkill.proficiency}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={newSkill.proficiency}
              onChange={(e) => setNewSkill({ ...newSkill, proficiency: parseInt(e.target.value) })}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Optional Proof / Artifact URL</label>
            <input
              type="url"
              placeholder="https://github.com/your-repo or certificate link"
              value={newSkill.evidence_url}
              onChange={(e) => setNewSkill({ ...newSkill, evidence_url: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={adding}>
              Add to Passport
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submit Evidence Modal */}
      <Modal
        isOpen={showEvidenceModal}
        onClose={() => setShowEvidenceModal(false)}
        title={`Submit Evidence for ${selectedSkillForEvidence?.name}`}
        description="Attach project repos, certificate verification URLs, or live apps as evidence."
      >
        <form onSubmit={handleSubmitEvidence} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Evidence Type</label>
            <select
              value={evidenceForm.evidence_type}
              onChange={(e) => setEvidenceForm({ ...evidenceForm, evidence_type: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
            >
              <option>GitHub Repository</option>
              <option>Live Deployed Project</option>
              <option>Certified Credential URL</option>
              <option>Research Paper / Publication</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Artifact URL *</label>
            <input
              type="url"
              required
              placeholder="https://..."
              value={evidenceForm.evidence_url}
              onChange={(e) => setEvidenceForm({ ...evidenceForm, evidence_url: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Notes / Description</label>
            <textarea
              rows={2}
              placeholder="Explain how this artifact proves your practical mastery..."
              value={evidenceForm.notes}
              onChange={(e) => setEvidenceForm({ ...evidenceForm, notes: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowEvidenceModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingEvidence}>
              Submit Evidence
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
