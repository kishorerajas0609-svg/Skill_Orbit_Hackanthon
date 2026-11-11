import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  Search,
  Building2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSkeleton, CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const RecruiterDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/recruiters/dashboard');
      setDashboardData(res.data);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <LoadingSkeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <CardSkeleton />
      </div>
    );
  }

  const { stats, profile, opportunities, recent_applications } = dashboardData || {};
  const isVerified = profile?.verification_status === 'verified';

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl border border-border bg-gradient-to-r from-cyan-950/40 via-surface to-emerald-950/30 p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-cyan-400">Recruiter Console</span>
              {isVerified ? (
                <Badge variant="emerald" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                  Verified Company
                </Badge>
              ) : (
                <Badge variant="amber" size="sm">
                  Pending Verification
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {profile?.company_name || 'Your Company Portal'}
            </h1>
            <p className="text-xs sm:text-sm text-foreground-muted max-w-xl">
              {profile?.position_title || 'Talent Acquisition'} • {profile?.industry || 'Technology Sector'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link to="/recruiter/post-opportunity">
              <Button size="sm" variant="primary" icon={<Plus className="w-4 h-4" />}>
                Post Opportunity
              </Button>
            </Link>
            <Link to="/recruiter/candidates">
              <Button size="sm" variant="secondary" icon={<Search className="w-4 h-4" />}>
                Discover Talent
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Active Listings</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">{stats?.active_opportunities || 0}</span>
            <span className="block text-[10px] text-cyan-400 font-medium">
              {stats?.total_opportunities || 0} total published
            </span>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Total Applicants</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">{stats?.total_applications || 0}</span>
            <span className="block text-[10px] text-emerald-400 font-medium">
              {stats?.under_review || 0} awaiting review
            </span>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Shortlisted Candidates</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">{stats?.shortlisted || 0}</span>
            <span className="block text-[10px] text-indigo-400 font-medium">
              {stats?.interviews_scheduled || 0} in interview
            </span>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Offers Extended</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">{stats?.offers_extended || 0}</span>
            <span className="block text-[10px] text-amber-400 font-medium">Final stage selections</span>
          </div>
        </Card>
      </div>

      {/* Published Opportunities List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Your Published Opportunities</h2>
          <Link to="/recruiter/manage-opportunities" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            Manage All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {opportunities && opportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((opp: any) => (
              <Card key={opp._id} hover className="p-5 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground">{opp.title}</h3>
                    <Badge variant={opp.status === 'active' ? 'emerald' : 'muted'} size="sm">
                      {opp.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-foreground-muted">
                    <span className="capitalize">{opp.type?.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{opp.openings} Openings</span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-400">{opp.applicants_count || 0} Applicants</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-border/60">
                  <Link
                    to={`/recruiter/opportunities/${opp._id}/applications`}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    View Applications ({opp.applicants_count || 0}) <ChevronRight className="w-3 h-3" />
                  </Link>
                  <span className="text-[11px] text-foreground-muted">
                    Deadline: {opp.application_deadline}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Briefcase className="w-6 h-6" />}
            title="No opportunities posted yet"
            description="Create your first job or internship listing to start receiving matched, verified candidate applications."
            actionText="Publish New Opportunity"
            onAction={() => window.location.href = '/recruiter/post-opportunity'}
          />
        )}
      </div>
    </div>
  );
};
