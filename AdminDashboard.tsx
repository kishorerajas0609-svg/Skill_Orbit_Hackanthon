import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  ShieldCheck,
  Users,
  Building2,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  FileCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton, CardSkeleton } from '../../components/ui/LoadingSkeleton';

export const AdminDashboard: React.FC = () => {
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  const fetchAdminDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setAdminData(res.data);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRecruiter = async (userId: string, status: 'verified' | 'rejected') => {
    setVerifyingId(userId);
    try {
      await api.post('/admin/verify-recruiter', {
        recruiter_user_id: userId,
        status,
        reason: status === 'verified' ? 'Verified company registration and CIN documents' : 'Insufficient company information',
      });
      await fetchAdminDashboard();
    } catch (e) {
      // ignore
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-28 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <LoadingSkeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <CardSkeleton />
      </div>
    );
  }

  const { metrics, pending_verifications, recent_audits } = adminData || {};

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative rounded-3xl border border-border bg-gradient-to-r from-slate-900 via-surface to-emerald-950/20 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400">Super Admin Console</span>
              <Badge variant="emerald" size="sm">System Master</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Platform Administration
            </h1>
            <p className="text-xs text-foreground-muted">
              Moderation, role access management, company verifications, and compliance audit history.
            </p>
          </div>

          <Link to="/admin/users">
            <Button variant="secondary" size="sm" icon={<Users className="w-4 h-4" />}>
              Manage All Users
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Total Users</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">{metrics?.total_users || 0}</span>
            <span className="block text-[10px] text-emerald-400 font-medium">
              {metrics?.students || 0} Students • {metrics?.recruiters || 0} Recruiters
            </span>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Colleges & Faculty</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">
              {(metrics?.institutions || 0) + (metrics?.academicians || 0)}
            </span>
            <span className="block text-[10px] text-indigo-400 font-medium">
              {metrics?.institutions || 0} Institutions • {metrics?.academicians || 0} Faculty
            </span>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Active Opportunities</span>
            <Briefcase className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">{metrics?.total_opportunities || 0}</span>
            <span className="block text-[10px] text-cyan-400 font-medium">
              {metrics?.total_applications || 0} Total Applications
            </span>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Pending Verifications</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="text-2xl font-bold text-amber-400">
              {metrics?.pending_recruiter_verifications || 0}
            </span>
            <span className="block text-[10px] text-foreground-muted">Companies in queue</span>
          </div>
        </Card>
      </div>

      {/* Recruiter Verification Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Recruiter Company Verification Queue</h2>
            <p className="text-xs text-foreground-muted">Review company credentials to grant verified recruiter privileges</p>
          </div>
          <Badge variant="amber">{pending_verifications?.length || 0} Pending</Badge>
        </div>

        {pending_verifications && pending_verifications.length > 0 ? (
          <div className="space-y-3">
            {pending_verifications.map((rec: any) => (
              <Card key={rec._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">{rec.company_name}</h3>
                    <Badge variant="amber" size="sm">Pending</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-foreground-muted">
                    <span>Contact: {rec.full_name} ({rec.email})</span>
                    <span>•</span>
                    <span>Industry: {rec.industry}</span>
                    <span>•</span>
                    <span>HQ: {rec.headquarters}</span>
                  </div>
                  {rec.description && (
                    <p className="text-xs text-foreground-muted italic line-clamp-1">
                      "{rec.description}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    loading={verifyingId === rec.user_id}
                    onClick={() => handleVerifyRecruiter(rec.user_id, 'verified')}
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Approve Company
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    loading={verifyingId === rec.user_id}
                    onClick={() => handleVerifyRecruiter(rec.user_id, 'rejected')}
                    icon={<XCircle className="w-3.5 h-3.5" />}
                  >
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-border text-center text-xs text-foreground-muted">
            No pending recruiter verifications at this time.
          </div>
        )}
      </div>

      {/* Audit Log Activity */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground">Recent Security & Platform Audit Logs</h2>
        {recent_audits && recent_audits.length > 0 ? (
          <Card className="p-0 overflow-hidden border-border bg-surface">
            <div className="divide-y divide-border/60">
              {recent_audits.map((log: any, idx: number) => (
                <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-surface-elevated/40">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="font-mono font-semibold text-foreground">{log.action}</span>
                    <span className="text-foreground-muted text-[11px]">User: {log.user_id || log.target_user_id}</span>
                  </div>
                  <span className="text-[10px] text-foreground-muted">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <div className="p-6 text-center border border-dashed border-border rounded-2xl text-xs text-foreground-muted">
            No audit logs recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};
