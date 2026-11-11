import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Opportunity } from '../../types';
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  ArrowLeft,
  Users
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MatchMeter } from '../../components/ui/MatchMeter';
import { Modal } from '../../components/ui/Modal';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchOpportunity(id);
  }, [id]);

  const fetchOpportunity = async (oppId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/opportunities/${oppId}`);
      setOpp(res.data?.opportunity);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opp) return;
    setApplying(true);
    setError('');

    try {
      await api.post('/applications', {
        opportunity_id: opp._id,
        cover_note: coverNote,
        resume_url: resumeUrl,
      });
      setApplySuccess(true);
      setTimeout(() => {
        setApplySuccess(false);
        setShowApplyModal(false);
        fetchOpportunity(opp._id);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <LoadingSkeleton className="h-44 rounded-3xl" />
        <LoadingSkeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-16">
        <h2 className="text-xl font-bold text-foreground">Opportunity Not Found</h2>
        <p className="text-xs text-foreground-muted">This listing may have expired or been removed.</p>
        <Link to="/opportunities">
          <Button variant="secondary" size="sm">Back to Explore</Button>
        </Link>
      </div>
    );
  }

  const breakdown = opp.match_breakdown;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <Link to="/opportunities" className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to all listings
      </Link>

      {/* Hero Header Card */}
      <Card className="p-8 border-border bg-gradient-to-r from-surface via-surface-elevated to-surface relative overflow-hidden shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="emerald" size="sm" className="capitalize">
                {opp.type.replace('_', ' ')}
              </Badge>
              <Badge variant="cyan" size="sm" className="capitalize">
                {opp.work_mode}
              </Badge>
              {opp.has_applied && (
                <Badge variant="indigo" size="sm">
                  Applied: {opp.application_status || 'Under Review'}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">{opp.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-muted">
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <Building2 className="w-4 h-4 text-emerald-400" /> {opp.company_name}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" /> {opp.location}
              </span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <DollarSign className="w-4 h-4" /> {opp.stipend_or_salary}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-400" /> {opp.openings} Openings
              </span>
            </div>
          </div>

          {/* Action button */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            {user?.role === 'student' && (
              <Button
                variant="primary"
                size="lg"
                disabled={opp.has_applied}
                onClick={() => setShowApplyModal(true)}
                icon={<Sparkles className="w-4 h-4" />}
              >
                {opp.has_applied ? 'Application Submitted' : '1-Click Apply Now'}
              </Button>
            )}
            <span className="text-[11px] text-foreground-muted">
              Deadline: {opp.application_deadline}
            </span>
          </div>
        </div>
      </Card>

      {/* Deterministic Match Breakdown (Student View) */}
      {user?.role === 'student' && breakdown && (
        <Card className="p-6 space-y-6 border-emerald-500/20 bg-gradient-to-b from-surface to-emerald-950/10">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Deterministic Match Analysis
              </h2>
              <p className="text-xs text-foreground-muted">
                Transparent score calculated by matching your Skill Passport with job criteria.
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-emerald-400">{breakdown.overall_match}%</span>
              <span className="block text-[10px] text-foreground-muted">Total Match Score</span>
            </div>
          </div>

          {/* 4 Score Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-xl bg-surface-elevated border border-border">
              <span className="text-lg font-bold text-foreground">{breakdown.breakdown?.skills_score}%</span>
              <span className="block text-[10px] text-foreground-muted mt-0.5">Required Skills (45%)</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-elevated border border-border">
              <span className="text-lg font-bold text-foreground">{breakdown.breakdown?.eligibility_score}%</span>
              <span className="block text-[10px] text-foreground-muted mt-0.5">Academic Eligibility (25%)</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-elevated border border-border">
              <span className="text-lg font-bold text-foreground">{breakdown.breakdown?.preference_score}%</span>
              <span className="block text-[10px] text-foreground-muted mt-0.5">Work Mode / Loc (15%)</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-elevated border border-border">
              <span className="text-lg font-bold text-foreground">{breakdown.breakdown?.experience_score}%</span>
              <span className="block text-[10px] text-foreground-muted mt-0.5">Portfolio Match (15%)</span>
            </div>
          </div>

          {/* Detailed Skill Overlap Chips */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap gap-2 items-center text-xs">
              <span className="font-semibold text-foreground">Matching Skills:</span>
              {breakdown.matching_skills?.length > 0 ? (
                breakdown.matching_skills.map((sk: any, idx: number) => (
                  <Badge key={idx} variant="emerald" size="sm">
                    ✓ {sk.skill} ({sk.student_level}%)
                  </Badge>
                ))
              ) : (
                <span className="text-foreground-muted">None registered yet</span>
              )}
            </div>

            {breakdown.weak_skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center text-xs">
                <span className="font-semibold text-foreground">Skills Needing Improvement:</span>
                {breakdown.weak_skills.map((sk: any, idx: number) => (
                  <Badge key={idx} variant="amber" size="sm">
                    ⚠ {sk.skill} (Gap: {sk.gap}%)
                  </Badge>
                ))}
              </div>
            )}

            {breakdown.missing_skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center text-xs">
                <span className="font-semibold text-foreground">Missing Required Skills:</span>
                {breakdown.missing_skills.map((sk: any, idx: number) => (
                  <Badge key={idx} variant="rose" size="sm">
                    ✕ {sk.skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Main Details */}
      <div className="space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-foreground">Role Description</h2>
          <p className="text-xs text-foreground-muted leading-relaxed whitespace-pre-line">
            {opp.description}
          </p>

          {opp.responsibilities && opp.responsibilities.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-border">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Key Responsibilities:</h3>
              <ul className="space-y-1.5 text-xs text-foreground-muted">
                {opp.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Academic & Hiring Criteria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-400" /> Academic Eligibility Criteria
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-foreground-muted block text-[11px]">Minimum CGPA Threshold</span>
                <span className="font-bold text-foreground">{opp.min_cgpa ? `${opp.min_cgpa} CGPA` : 'No cutoff'}</span>
              </div>
              <div>
                <span className="text-foreground-muted block text-[11px]">Eligible Departments</span>
                <span className="font-semibold text-foreground">
                  {opp.eligible_departments?.length ? opp.eligible_departments.join(', ') : 'All Engineering & Tech Streams'}
                </span>
              </div>
              <div>
                <span className="text-foreground-muted block text-[11px]">Eligible Cohorts / Graduation Years</span>
                <span className="font-semibold text-foreground">
                  {opp.eligible_graduation_years?.length ? opp.eligible_graduation_years.join(', ') : 'Open to All Batches'}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Selection Pipeline Stages
            </h3>
            <div className="space-y-2">
              {opp.selection_stages?.map((stage, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-foreground-muted">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-elevated border border-border text-[10px] font-bold text-emerald-400">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-foreground">{stage}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title={`Apply for ${opp.title}`}
        description={`Submit application to ${opp.company_name}`}
      >
        {applySuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-foreground">Application Submitted!</h3>
            <p className="text-xs text-foreground-muted">
              Your application and Skill Passport credentials have been dispatched.
            </p>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-rose-500/10 text-xs text-rose-400 border border-rose-500/30">{error}</div>}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Cover Note / Intro</label>
              <textarea
                rows={4}
                placeholder="Explain why your verified technical skills make you a strong candidate for this position..."
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Resume Hosted Link (Optional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowApplyModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={applying}>
                Submit Application
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
