import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Application, Opportunity } from '../../types';
import {
  Users,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Award,
  Sparkles,
  Building2,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { MatchMeter } from '../../components/ui/MatchMeter';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const OpportunityApplicationsPage: React.FC = () => {
  const { oppId } = useParams<{ oppId: string }>();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');

  useEffect(() => {
    if (oppId) fetchApplications(oppId);
  }, [oppId]);

  const fetchApplications = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/applications/opportunity/${id}`);
      setApplications(res.data?.applications || []);
      setOpportunity(res.data?.opportunity);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    setUpdatingId(appId);
    try {
      await api.put(`/applications/${appId}/status`, {
        status: newStatus,
        feedback: feedbackNote || `Candidate moved to ${newStatus}`,
      });
      setFeedbackNote('');
      if (oppId) await fetchApplications(oppId);
      if (selectedApp && selectedApp._id === appId) {
        setSelectedApp((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      }
    } catch (e) {
      // ignore
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-24 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <LoadingSkeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link to="/recruiter/manage-opportunities" className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to listings
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-foreground">
              Candidate Pipeline: {opportunity?.title}
            </h1>
            <Badge variant="cyan" size="sm">{applications.length} Applicants</Badge>
          </div>
          <p className="text-xs text-foreground-muted mt-1">
            Review candidate match breakdowns, inspect verified Skill Passports, and update pipeline stages.
          </p>
        </div>
      </div>

      {/* Applicants List */}
      {applications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {applications.map((app) => {
            const isUpdating = updatingId === app._id;
            const stu = app.student_profile;
            const verifiedCount = stu?.skills?.filter((s) => s.verified)?.length || 0;

            return (
              <Card key={app._id} hover className="p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 font-bold text-sm border border-cyan-500/30">
                        {app.applicant_name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{app.applicant_name}</h3>
                        <span className="text-xs text-foreground-muted">{app.applicant_email}</span>
                      </div>
                    </div>

                    <Badge variant={app.status === 'Selected' ? 'emerald' : app.status === 'Interview' ? 'cyan' : 'muted'} size="sm">
                      {app.status}
                    </Badge>
                  </div>

                  {/* Match score bar & academic badge */}
                  <div className="p-3 rounded-xl bg-surface-elevated border border-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground-muted">Deterministic Match Score</span>
                      <span className="font-bold text-emerald-400">{app.match_score_at_apply}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        style={{ width: `${app.match_score_at_apply}%` }}
                      />
                    </div>
                  </div>

                  {/* Academic & Skill Passport badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {stu?.academic?.institution_name && (
                      <span className="text-foreground-muted flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-cyan-400" /> {stu.academic.institution_name} ({stu.academic.cgpa} CGPA)
                      </span>
                    )}
                    <Badge variant="emerald" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                      {verifiedCount} Verified Skills
                    </Badge>
                  </div>

                  {app.cover_note && (
                    <p className="text-xs text-foreground-muted/90 italic line-clamp-2">
                      "{app.cover_note}"
                    </p>
                  )}
                </div>

                {/* Status action buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/60">
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    View Full Dossier
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant={app.status === 'Shortlisted' ? 'primary' : 'outline'}
                      loading={isUpdating}
                      onClick={() => handleUpdateStatus(app._id, 'Shortlisted')}
                    >
                      Shortlist
                    </Button>
                    <Button
                      size="sm"
                      variant={app.status === 'Interview' ? 'primary' : 'outline'}
                      loading={isUpdating}
                      onClick={() => handleUpdateStatus(app._id, 'Interview')}
                    >
                      Interview
                    </Button>
                    <Button
                      size="sm"
                      variant={app.status === 'Selected' ? 'primary' : 'outline'}
                      loading={isUpdating}
                      onClick={() => handleUpdateStatus(app._id, 'Selected')}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No candidates applied yet"
          description="Candidates will appear here with calculated match percentages when they submit applications."
          actionText="Search Eligible Candidates"
          onAction={() => window.location.href = '/recruiter/candidates'}
        />
      )}

      {/* Candidate Full Dossier Modal */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title={`Candidate Dossier: ${selectedApp?.applicant_name}`}
        description={`Applied for ${opportunity?.title} on ${selectedApp?.applied_at ? new Date(selectedApp.applied_at).toLocaleDateString() : ''}`}
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Match Score & Status Header */}
          <div className="p-4 rounded-2xl bg-surface-elevated border border-border flex items-center justify-between">
            <div>
              <span className="text-xs text-foreground-muted block">Match Score at Apply</span>
              <span className="text-2xl font-extrabold text-emerald-400">{selectedApp?.match_score_at_apply}%</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-foreground-muted block">Current Stage</span>
              <Badge variant="cyan" size="md">{selectedApp?.status}</Badge>
            </div>
          </div>

          {/* Academic Info */}
          {selectedApp?.student_profile?.academic && (
            <div className="p-4 rounded-xl border border-border bg-surface space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Academic Information</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-foreground-muted block text-[10px]">Institution</span>
                  <span className="font-semibold text-foreground">{selectedApp.student_profile.academic.institution_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-foreground-muted block text-[10px]">Department & Degree</span>
                  <span className="font-semibold text-foreground">
                    {selectedApp.student_profile.academic.degree} - {selectedApp.student_profile.academic.department}
                  </span>
                </div>
                <div>
                  <span className="text-foreground-muted block text-[10px]">CGPA</span>
                  <span className="font-bold text-emerald-400">{selectedApp.student_profile.academic.cgpa}</span>
                </div>
                <div>
                  <span className="text-foreground-muted block text-[10px]">Graduation Batch</span>
                  <span className="font-semibold text-foreground">{selectedApp.student_profile.academic.graduation_year}</span>
                </div>
              </div>
            </div>
          )}

          {/* Skill Passport Skills */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Candidate Skill Passport</h4>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
              {selectedApp?.student_profile?.skills?.map((sk, i) => (
                <div
                  key={i}
                  className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 ${
                    sk.verified
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-semibold'
                      : 'bg-surface-elevated border-border text-foreground'
                  }`}
                >
                  {sk.verified && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                  <span>{sk.name} ({sk.proficiency}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cover note & Links */}
          {selectedApp?.cover_note && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Candidate Cover Note</h4>
              <p className="text-xs text-foreground-muted p-3 rounded-xl bg-surface-elevated border border-border leading-relaxed">
                {selectedApp.cover_note}
              </p>
            </div>
          )}

          {/* Status update buttons inside modal */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button variant="secondary" size="sm" onClick={() => setSelectedApp(null)}>
              Close
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedApp && handleUpdateStatus(selectedApp._id, 'Rejected')}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => selectedApp && handleUpdateStatus(selectedApp._id, 'Interview')}
              >
                Schedule Interview
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => selectedApp && handleUpdateStatus(selectedApp._id, 'Selected')}
              >
                Select Candidate
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
