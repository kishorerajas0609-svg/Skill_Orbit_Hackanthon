import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  Award,
  Briefcase,
  Layers,
  Sparkles,
  TrendingUp,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Compass,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSkeleton, CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const StudentDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/students/dashboard');
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
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <CardSkeleton />
      </div>
    );
  }

  const { readiness, stats, user, dream_role, recent_assessments, academic } = dashboardData || {};
  const readinessScore = readiness?.overall_score || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl border border-border bg-gradient-to-r from-emerald-950/40 via-surface to-teal-950/30 p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400">Student Dashboard</span>
              <Badge variant="emerald" size="sm">Active Account</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Hello, {user?.full_name || 'Student'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-foreground-muted max-w-xl">
              Targeting: <span className="font-semibold text-emerald-400">{dream_role || 'Full Stack Developer'}</span> • {academic?.institution_name || 'Institution Registered'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link to="/student/assessments">
              <Button size="sm" variant="primary" icon={<Sparkles className="w-3.5 h-3.5" />}>
                Take Assessment
              </Button>
            </Link>
            <Link to="/opportunities">
              <Button size="sm" variant="secondary" icon={<Briefcase className="w-3.5 h-3.5" />}>
                Explore Opportunities
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Placement Readiness</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">{readinessScore}%</span>
            <span className="block text-[10px] text-emerald-400 font-medium">{readiness?.tier || 'Placement Eligible'}</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Skill Passport</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">{stats?.total_skills || 0}</span>
            <span className="block text-[10px] text-cyan-400 font-medium">{stats?.verified_skills || 0} Verified Skills</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Active Applications</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">{stats?.active_applications || 0}</span>
            <span className="block text-[10px] text-indigo-400 font-medium">{stats?.shortlisted_applications || 0} Shortlisted / In Interview</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Assessments Taken</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">{stats?.completed_assessments || 0}</span>
            <span className="block text-[10px] text-amber-400 font-medium">{stats?.projects_count || 0} Portfolio Projects</span>
          </div>
        </Card>
      </div>

      {/* Main Split: Readiness Breakdown + Career Roadmap Quick Link */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placement Readiness Breakdown */}
        <Card className="lg:col-span-2 space-y-5 p-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Placement Readiness Breakdown</h2>
              <p className="text-xs text-foreground-muted">Deterministic scoring calculated from your real verified records</p>
            </div>
            <Badge variant="emerald">{readiness?.tier || 'Calculating'}</Badge>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-foreground">Academic Profile & Eligibility</span>
                <span className="text-emerald-400 font-bold">{readiness?.academic_completeness || 0} / 25 pts</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-elevated overflow-hidden border border-border">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${((readiness?.academic_completeness || 0) / 25) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-foreground">Skill Passport & Verifications</span>
                <span className="text-cyan-400 font-bold">{readiness?.skill_passport_score || 0} / 30 pts</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-elevated overflow-hidden border border-border">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${((readiness?.skill_passport_score || 0) / 30) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-foreground">Project Portfolio & Live Artifacts</span>
                <span className="text-indigo-400 font-bold">{readiness?.project_portfolio_score || 0} / 25 pts</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-elevated overflow-hidden border border-border">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${((readiness?.project_portfolio_score || 0) / 25) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-foreground">Timed Assessments & Evaluations</span>
                <span className="text-amber-400 font-bold">{readiness?.assessment_score || 0} / 20 pts</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-elevated overflow-hidden border border-border">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${((readiness?.assessment_score || 0) / 20) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <span className="text-xs text-foreground-muted">
              Higher scores increase your match rate in recruiter discovery searches.
            </span>
            <Link to="/student/skill-passport">
              <Button size="sm" variant="outline" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                Boost Score
              </Button>
            </Link>
          </div>
        </Card>

        {/* Quick Target Action Card */}
        <Card className="space-y-4 p-6 flex flex-col justify-between border-cyan-500/20 bg-gradient-to-b from-surface to-cyan-950/10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Target Role Engine</h3>
                <span className="text-[11px] text-foreground-muted">Deterministic Benchmark</span>
              </div>
            </div>

            <p className="text-xs text-foreground-muted leading-relaxed">
              Your career co-pilot is tracking industry requirements for <strong className="text-foreground">{dream_role}</strong>. View your missing proficiencies and follow the AI roadmap.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Link to="/student/roadmap" className="block w-full">
              <Button size="sm" variant="primary" className="w-full" icon={<Compass className="w-3.5 h-3.5" />}>
                View Skill Gap & Roadmap
              </Button>
            </Link>
            <Link to="/student/applications" className="block w-full">
              <Button size="sm" variant="secondary" className="w-full" icon={<FileCheck className="w-3.5 h-3.5" />}>
                Track Applications
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Assessment Attempts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Recent Verified Assessments</h2>
          <Link to="/student/assessments" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            Browse All Assessments <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent_assessments && recent_assessments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent_assessments.map((attempt: any) => (
              <Card key={attempt._id} hover className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{attempt.category}</span>
                  <Badge variant={attempt.passed ? 'emerald' : 'amber'} size="sm">
                    {attempt.passed ? 'Verified Badge' : 'Completed'}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-foreground">{attempt.score_percentage}%</span>
                  <span className="text-xs text-foreground-muted">({attempt.correct_answers} / {attempt.total_questions} correct)</span>
                </div>
                <div className="text-[11px] text-foreground-muted">
                  Strengths: {attempt.strengths?.slice(0, 2).join(', ') || 'Core concepts'}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Award className="w-6 h-6" />}
            title="No assessments taken yet"
            description="Take your first timed technical assessment to verify your skills and unlock verified badges on your Skill Passport."
            actionText="Take a 15-Min Assessment"
            onAction={() => window.location.href = '/student/assessments'}
          />
        )}
      </div>
    </div>
  );
};
