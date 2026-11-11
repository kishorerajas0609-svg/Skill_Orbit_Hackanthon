import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Opportunity } from '../../types';
import {
  Search,
  Briefcase,
  MapPin,
  Building2,
  DollarSign,
  Calendar,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MatchMeter } from '../../components/ui/MatchMeter';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const ExploreOpportunitiesPage: React.FC = () => {
  const { user } = useAuth();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedWorkMode, setSelectedWorkMode] = useState('all');
  const [minMatch, setMinMatch] = useState<number>(0);

  // Apply Modal state
  const [applyingOpportunity, setApplyingOpportunity] = useState<Opportunity | null>(null);
  const [coverNote, setCoverNote] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    fetchOpportunities();
  }, [selectedType, selectedWorkMode]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (query) params.query = query;
      if (selectedType !== 'all') params.type = selectedType;
      if (selectedWorkMode !== 'all') params.work_mode = selectedWorkMode;
      if (minMatch > 0) params.min_match = minMatch;

      const res = await api.get('/opportunities/search', { params });
      setOpportunities(res.data?.opportunities || []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOpportunities();
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingOpportunity) return;
    setApplying(true);
    setApplyError('');

    try {
      await api.post('/applications', {
        opportunity_id: applyingOpportunity._id,
        cover_note: coverNote,
        resume_url: resumeUrl,
      });
      setApplySuccess(true);
      setTimeout(() => {
        setApplySuccess(false);
        setApplyingOpportunity(null);
        setCoverNote('');
        fetchOpportunities();
      }, 2000);
    } catch (err: any) {
      setApplyError(err.response?.data?.detail || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="space-y-3 border-b border-border pb-6">
        <div className="flex items-center gap-2">
          <Badge variant="emerald">Live Opportunities</Badge>
          {user?.role === 'student' && <Badge variant="cyan">Deterministic Matching Active</Badge>}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          Explore Verified Jobs & Internships
        </h1>
        <p className="text-xs sm:text-sm text-foreground-muted max-w-2xl">
          Opportunities published directly by verified recruiters. Real match scores are dynamically calculated against your Skill Passport.
        </p>

        {/* Search Bar & Filter Controls */}
        <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search by job title, skill (e.g. React, Python), or company name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-xs text-foreground placeholder-foreground-muted focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="internship">Internship</option>
              <option value="full_time">Full-Time</option>
              <option value="apprenticeship">Apprenticeship</option>
            </select>

            <select
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Work Modes</option>
              <option value="remote">Remote Only</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>

            <Button type="submit" variant="primary" size="md" icon={<Search className="w-4 h-4" />}>
              Search
            </Button>
          </div>
        </form>
      </div>

      {/* Opportunities List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => <LoadingSkeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : opportunities.length > 0 ? (
        <div className="space-y-4">
          {opportunities.map((opp) => (
            <Card key={opp._id} hover className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/opportunities/${opp._id}`}
                      className="text-base font-bold text-foreground hover:text-emerald-400 transition-colors"
                    >
                      {opp.title}
                    </Link>
                    <Badge variant="cyan" size="sm" className="capitalize">
                      {opp.type.replace('_', ' ')}
                    </Badge>
                    <Badge variant="muted" size="sm" className="capitalize">
                      {opp.work_mode}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-muted">
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <Building2 className="w-3.5 h-3.5 text-foreground-muted" /> {opp.company_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-foreground-muted" /> {opp.location}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <DollarSign className="w-3.5 h-3.5" /> {opp.stipend_or_salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-foreground-muted" /> Deadline: {opp.application_deadline}
                    </span>
                  </div>

                  <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed pt-1">
                    {opp.description}
                  </p>

                  {/* Required Skills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-foreground-muted mr-1">Required:</span>
                    {opp.required_skills?.map((sk, idx) => (
                      <Badge key={idx} variant="muted" size="sm">
                        {typeof sk === 'string' ? sk : `${sk.name} (${sk.min_proficiency || 60}%)`}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Right Side: Match score & Action */}
                <div className="flex flex-col items-end justify-between space-y-3 shrink-0">
                  {user?.role === 'student' && opp.match_score !== undefined && (
                    <MatchMeter score={opp.match_score} size="sm" />
                  )}

                  <div className="flex items-center gap-2">
                    <Link to={`/opportunities/${opp._id}`}>
                      <Button variant="secondary" size="sm">
                        View Details
                      </Button>
                    </Link>

                    {user?.role === 'student' && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={opp.has_applied}
                        onClick={() => setApplyingOpportunity(opp)}
                        icon={<Sparkles className="w-3.5 h-3.5" />}
                      >
                        {opp.has_applied ? 'Applied' : '1-Click Apply'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Briefcase className="w-6 h-6" />}
          title="No opportunities found"
          description="Opportunities will appear here when verified recruiters publish jobs or internships."
          actionText={user?.role === 'recruiter' ? 'Publish an Opportunity' : 'Clear Search Filters'}
          onAction={() => {
            if (user?.role === 'recruiter') {
              window.location.href = '/recruiter/post-opportunity';
            } else {
              setQuery('');
              setSelectedType('all');
              setSelectedWorkMode('all');
              fetchOpportunities();
            }
          }}
        />
      )}

      {/* Apply Modal */}
      <Modal
        isOpen={!!applyingOpportunity}
        onClose={() => setApplyingOpportunity(null)}
        title={`Apply for ${applyingOpportunity?.title}`}
        description={`Submit application to ${applyingOpportunity?.company_name}`}
      >
        {applySuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-foreground">Application Submitted!</h3>
            <p className="text-xs text-foreground-muted">
              The recruiter has received your application and Skill Passport credentials.
            </p>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-4">
            {applyError && <div className="p-3 rounded-xl bg-rose-500/10 text-xs text-rose-400 border border-rose-500/30">{applyError}</div>}

            {applyingOpportunity?.match_score !== undefined && (
              <div className="p-3 rounded-xl bg-surface-elevated border border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Your Match Alignment</span>
                <MatchMeter score={applyingOpportunity.match_score} size="sm" />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Cover Note / Why you're a strong fit</label>
              <textarea
                rows={4}
                placeholder="Highlight your relevant verified skills, project implementations, and passion for the role..."
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Resume Document Link (Optional)</label>
              <input
                type="url"
                placeholder="https://drive.google.com/... or hosted PDF link"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setApplyingOpportunity(null)}>
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
