import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  Award,
  BarChart3,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton, CardSkeleton } from '../../components/ui/LoadingSkeleton';

export const InstitutionDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/institutions/analytics');
      setAnalytics(res.data);
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

  const { metrics, department_distribution, top_skills, students_preview, institution_name, has_data } = analytics || {};

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl border border-border bg-gradient-to-r from-indigo-950/40 via-surface to-cyan-950/30 p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-400">Institution Portal</span>
              <Badge variant="indigo" size="sm">AISHE Verified</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {institution_name || 'Academic Institution Dashboard'}
            </h1>
            <p className="text-xs sm:text-sm text-foreground-muted max-w-xl">
              Real-time student employability analytics, department skill distribution, and recruiter engagement.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link to="/institution/students">
              <Button size="sm" variant="primary" icon={<Users className="w-4 h-4" />}>
                View Student Directory
              </Button>
            </Link>
            <Link to="/opportunities">
              <Button size="sm" variant="secondary" icon={<GraduationCap className="w-4 h-4" />}>
                Explore Active Placements
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Enrolled Students</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">{metrics?.total_students || 0}</span>
            <span className="block text-[10px] text-indigo-400 font-medium">Registered on SkillOrbit</span>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Average CGPA</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">{metrics?.average_cgpa || '0.00'}</span>
            <span className="block text-[10px] text-emerald-400 font-medium">Academic performance</span>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Job Applications</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">{metrics?.total_applications || 0}</span>
            <span className="block text-[10px] text-cyan-400 font-medium">Submissions to recruiters</span>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Placement Offers</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">{metrics?.placed_students || 0}</span>
            <span className="block text-[10px] text-amber-400 font-medium">
              {metrics?.placement_rate || 0}% placement rate
            </span>
          </div>
        </Card>
      </div>

      {/* Analytics Charts Split */}
      {has_data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Distribution Chart */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground">Department Cohort Distribution</h2>
                <p className="text-xs text-foreground-muted">Students count across technical streams</p>
              </div>
              <Badge variant="indigo" size="sm">Real Records</Badge>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={department_distribution || []}>
                  <XAxis dataKey="department" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#11131a',
                      borderColor: '#232734',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="students" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Top In-Demand Skills Chart */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground">Cohort Top Skill Frequencies</h2>
                <p className="text-xs text-foreground-muted">Most common verified skills across student body</p>
              </div>
              <Badge variant="emerald" size="sm">Skill Passport</Badge>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top_skills || []} layout="vertical">
                  <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis dataKey="skill" type="category" stroke="#64748b" fontSize={10} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#11131a',
                      borderColor: '#232734',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      ) : (
        <EmptyState
          icon={<BarChart3 className="w-6 h-6" />}
          title="Student analytics will appear after students join"
          description="When students register and list your institution name, real-time cohort skill heatmaps and placement metrics will populate here."
          actionText="View Student Directory"
          onAction={() => window.location.href = '/institution/students'}
        />
      )}

      {/* Recent Registered Students Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Registered Students Preview</h2>
          <Link to="/institution/students" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View All Students <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {students_preview && students_preview.length > 0 ? (
          <Card className="p-0 overflow-hidden border-border bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-elevated border-b border-border text-foreground-muted uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">CGPA</th>
                    <th className="p-3.5">Graduation Year</th>
                    <th className="p-3.5">Skill Passport</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {students_preview.map((s: any) => (
                    <tr key={s.id} className="hover:bg-surface-elevated/40">
                      <td className="p-3.5 font-bold text-foreground">{s.full_name}</td>
                      <td className="p-3.5 text-foreground-muted">{s.department}</td>
                      <td className="p-3.5 font-semibold text-emerald-400">{s.cgpa}</td>
                      <td className="p-3.5 text-foreground-muted">{s.graduation_year}</td>
                      <td className="p-3.5">
                        <Badge variant="emerald" size="sm">
                          {s.verified_skills_count} Verified Skills
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="p-6 text-center border border-dashed border-border rounded-2xl text-xs text-foreground-muted">
            No students registered yet for this institution.
          </div>
        )}
      </div>
    </div>
  );
};
