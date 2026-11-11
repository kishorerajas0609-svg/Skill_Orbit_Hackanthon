import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Opportunity } from '../../types';
import {
  Briefcase,
  Users,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const ManageOpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOpportunities();
  }, []);

  const fetchMyOpportunities = async () => {
    try {
      const res = await api.get('/recruiters/dashboard');
      setOpportunities(res.data?.opportunities || []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (oppId: string) => {
    if (!confirm('Are you sure you want to remove this opportunity?')) return;
    try {
      await api.delete(`/opportunities/${oppId}`);
      await fetchMyOpportunities();
    } catch (e) {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-20 w-full rounded-2xl" />
        {[1, 2, 3].map((i) => <LoadingSkeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Manage Published Opportunities</h1>
          <p className="text-xs text-foreground-muted">
            Track applicants, monitor match score distributions, and update opportunity statuses.
          </p>
        </div>

        <Link to="/recruiter/post-opportunity">
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
            Post New Opportunity
          </Button>
        </Link>
      </div>

      {opportunities.length > 0 ? (
        <div className="space-y-4">
          {opportunities.map((opp) => (
            <Card key={opp._id} hover className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">{opp.title}</h3>
                    <Badge variant="cyan" size="sm" className="capitalize">{opp.type.replace('_', ' ')}</Badge>
                    <Badge variant={opp.status === 'active' ? 'emerald' : 'muted'} size="sm">
                      {opp.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-muted">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-foreground-muted" /> {opp.location} ({opp.work_mode})
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <DollarSign className="w-3.5 h-3.5" /> {opp.stipend_or_salary}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <Users className="w-3.5 h-3.5 text-cyan-400" /> {opp.applicants_count || 0} Total Applicants
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-foreground-muted" /> Deadline: {opp.application_deadline}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/recruiter/opportunities/${opp._id}/applications`}>
                    <Button variant="primary" size="sm" icon={<Users className="w-3.5 h-3.5" />}>
                      Review Candidates ({opp.applicants_count || 0})
                    </Button>
                  </Link>

                  <button
                    onClick={() => handleDelete(opp._id)}
                    className="p-2 rounded-xl text-foreground-muted hover:text-rose-400 hover:bg-surface-elevated transition-colors"
                    title="Remove listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Briefcase className="w-6 h-6" />}
          title="No opportunities published yet"
          description="Publish your first job or internship listing to start attracting verified students."
          actionText="Publish an Opportunity"
          onAction={() => window.location.href = '/recruiter/post-opportunity'}
        />
      )}
    </div>
  );
};
