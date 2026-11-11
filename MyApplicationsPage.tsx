import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Application } from '../../types';
import {
  Briefcase,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MatchMeter } from '../../components/ui/MatchMeter';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const MyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my-applications');
      setApplications(res.data?.applications || []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appId: string) => {
    if (!confirm('Are you sure you want to withdraw your application?')) return;
    setWithdrawingId(appId);
    try {
      await api.post(`/applications/${appId}/withdraw`);
      await fetchApplications();
    } catch (e) {
      // ignore
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Selected':
      case 'Offer Accepted':
        return <Badge variant="emerald">{status}</Badge>;
      case 'Interview':
        return <Badge variant="cyan">{status}</Badge>;
      case 'Shortlisted':
        return <Badge variant="indigo">{status}</Badge>;
      case 'Under Review':
        return <Badge variant="amber">{status}</Badge>;
      case 'Rejected':
      case 'Offer Declined':
        return <Badge variant="rose">{status}</Badge>;
      case 'Withdrawn':
        return <Badge variant="muted">{status}</Badge>;
      default:
        return <Badge variant="muted">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-20 w-full rounded-2xl" />
        {[1, 2, 3].map((i) => <LoadingSkeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
    );
  }

  const filteredApps = applications.filter((app) => {
    if (filterStatus === 'all') return true;
    return app.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Application Tracking Pipeline</h1>
          <p className="text-xs text-foreground-muted">
            Track real-time status updates, recruiter evaluations, and interview schedules.
          </p>
        </div>

        <Link to="/opportunities">
          <Button variant="primary" size="sm" icon={<Briefcase className="w-4 h-4" />}>
            Explore More Jobs
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        {[
          { key: 'all', label: `All Applications (${applications.length})` },
          { key: 'applied', label: 'Applied' },
          { key: 'under review', label: 'Under Review' },
          { key: 'shortlisted', label: 'Shortlisted' },
          { key: 'interview', label: 'Interview' },
          { key: 'selected', label: 'Selected' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === tab.key
                ? 'bg-surface-elevated text-emerald-400 border border-emerald-500/30'
                : 'text-foreground-muted hover:text-foreground hover:bg-surface-elevated/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApps.length > 0 ? (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <Card key={app._id} hover className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">{app.opportunity_title}</h3>
                    <Badge variant="cyan" size="sm" className="capitalize">{app.opportunity_type}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-foreground-muted">
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <Building2 className="w-3.5 h-3.5 text-foreground-muted" /> {app.company_name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-foreground-muted" /> Applied on {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-foreground-muted block">Match at Apply</span>
                    <span className="text-sm font-bold text-emerald-400">{app.match_score_at_apply}%</span>
                  </div>
                  {getStatusBadge(app.status)}
                </div>
              </div>

              {/* Status Timeline Preview */}
              {app.timeline && app.timeline.length > 0 && (
                <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-border space-y-2">
                  <span className="text-[11px] font-bold text-foreground-muted uppercase tracking-wider">
                    Status History & Activity:
                  </span>
                  <div className="space-y-1.5">
                    {app.timeline.map((entry, idx) => (
                      <div key={idx} className="flex items-start justify-between text-xs text-foreground-muted">
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                          <span className="font-semibold text-foreground">{entry.status}</span>
                          {entry.note && <span>— {entry.note}</span>}
                        </div>
                        <span className="text-[10px] text-foreground-muted/60">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                <Link
                  to={`/opportunities/${app.opportunity_id}`}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  View Job Listing <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                {app.status !== 'Withdrawn' && app.status !== 'Rejected' && (
                  <button
                    onClick={() => handleWithdraw(app._id)}
                    disabled={withdrawingId === app._id}
                    className="text-rose-400 hover:text-rose-300 text-xs font-semibold"
                  >
                    {withdrawingId === app._id ? 'Withdrawing...' : 'Withdraw Application'}
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Briefcase className="w-6 h-6" />}
          title="No applications in this category"
          description="Browse published verified opportunities and submit your application with 1-click."
          actionText="Explore Opportunities"
          onAction={() => window.location.href = '/opportunities'}
        />
      )}
    </div>
  );
};
