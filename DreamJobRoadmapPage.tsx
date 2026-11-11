import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import {
  Compass,
  Sparkles,
  Target,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Award,
  RefreshCw,
  Clock,
  BookOpen,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const DreamJobRoadmapPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('Full Stack Developer');
  const [gapData, setGapData] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [rolesRes, gapRes, roadmapRes] = await Promise.all([
        api.get('/roadmap/available-roles'),
        api.get('/roadmap/skill-gaps'),
        api.get('/roadmap/my-roadmap'),
      ]);
      setRoles(rolesRes.data?.roles || []);
      setGapData(gapRes.data?.gap_analysis);
      setSelectedRole(gapRes.data?.target_role || 'Full Stack Developer');
      setRoadmap(roadmapRes.data?.roadmap);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (roleName: string) => {
    setSelectedRole(roleName);
    setLoading(true);
    try {
      await api.post('/roadmap/set-target-role', { target_role: roleName });
      const [gapRes, roadmapRes] = await Promise.all([
        api.get('/roadmap/skill-gaps'),
        api.get('/roadmap/my-roadmap'),
      ]);
      setGapData(gapRes.data?.gap_analysis);
      setRoadmap(roadmapRes.data?.roadmap);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateRoadmap = async () => {
    setRegenerating(true);
    try {
      const res = await api.post('/roadmap/regenerate');
      setRoadmap(res.data?.roadmap);
    } catch (e) {
      // ignore
    } finally {
      setRegenerating(false);
    }
  };

  const handleToggleTask = async (phaseNum: number, taskIdx: number, currentCompleted: boolean) => {
    const key = `phase_${phaseNum}_task_${taskIdx}`;
    setUpdatingTask(key);

    try {
      await api.post('/roadmap/task-progress', {
        phase: phaseNum,
        task_index: taskIdx,
        completed: !currentCompleted,
      });

      setRoadmap((prev: any) => ({
        ...prev,
        progress_state: {
          ...(prev?.progress_state || {}),
          [key]: !currentCompleted,
        },
      }));
    } catch (e) {
      // ignore
    } finally {
      setUpdatingTask(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LoadingSkeleton className="h-64 rounded-2xl" />
          <LoadingSkeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  const readiness = gapData?.readiness_percentage || 0;
  const skillsAnalysis = gapData?.skills || [];

  return (
    <div className="space-y-8">
      {/* Header & Target Role Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-foreground">Target Role & Skill Gap Analysis</h1>
            <Badge variant="cyan" size="sm">Deterministic Engine</Badge>
          </div>
          <p className="text-xs text-foreground-muted">
            Benchmark your current Skill Passport against standard industry hiring requirements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-foreground-muted whitespace-nowrap">Target Role:</label>
          <select
            value={selectedRole}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="rounded-xl border border-border bg-surface-elevated px-3 py-1.5 text-xs text-foreground font-semibold focus:border-emerald-500 focus:outline-none"
          >
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Role Readiness Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4 border-emerald-500/20 bg-gradient-to-b from-surface to-emerald-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Role Readiness Match</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-extrabold text-emerald-400">{readiness}%</span>
            <span className="block text-xs text-foreground-muted mt-1">
              Alignment with industry {selectedRole} benchmarks
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-center text-xs">
            <div>
              <span className="font-bold text-emerald-400">{gapData?.strong_skills_count || 0}</span>
              <span className="block text-[10px] text-foreground-muted">Strong</span>
            </div>
            <div>
              <span className="font-bold text-amber-400">{gapData?.weak_skills_count || 0}</span>
              <span className="block text-[10px] text-foreground-muted">Weak</span>
            </div>
            <div>
              <span className="font-bold text-rose-400">{gapData?.missing_skills_count || 0}</span>
              <span className="block text-[10px] text-foreground-muted">Missing</span>
            </div>
          </div>
        </Card>

        {/* Gemini AI Strategic Advice */}
        <Card className="md:col-span-2 p-6 space-y-3 border-border bg-surface flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" /> SkillOrbit AI Strategy Insights
              </span>
              <Badge variant="emerald" size="sm">Gemini Co-Pilot</Badge>
            </div>
            <div className="text-xs text-foreground-muted leading-relaxed whitespace-pre-line prose-sm">
              {roadmap?.explanation || 'Your skills provide a solid foundation. Follow the personalized learning milestones below to bridge key gap proficiencies.'}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              loading={regenerating}
              onClick={handleRegenerateRoadmap}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Regenerate AI Strategy
            </Button>
          </div>
        </Card>
      </div>

      {/* Skill Gap Detailed Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Benchmark Skill Breakdown</h2>
          <span className="text-xs text-foreground-muted">
            {skillsAnalysis.length} criteria evaluated
          </span>
        </div>

        <Card className="p-0 overflow-hidden border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated border-b border-border text-foreground-muted uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3.5">Skill & Category</th>
                  <th className="p-3.5">Target Level</th>
                  <th className="p-3.5">Your Level</th>
                  <th className="p-3.5">Gap</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {skillsAnalysis.map((sk: any, idx: number) => {
                  const isStrong = sk.status === 'Strong';
                  const isWeak = sk.status === 'Needs Improvement';

                  return (
                    <tr key={idx} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="p-3.5">
                        <span className="font-bold text-foreground block">{sk.skill}</span>
                        <span className="text-[10px] text-foreground-muted">{sk.category} • {sk.importance}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-foreground">{sk.required_proficiency}%</td>
                      <td className="p-3.5 font-bold text-foreground">
                        {sk.current_proficiency > 0 ? `${sk.current_proficiency}%` : 'Not added'}
                        {sk.verified && <span className="ml-1 text-[10px] text-emerald-400">✓</span>}
                      </td>
                      <td className="p-3.5 font-semibold">
                        {sk.gap > 0 ? (
                          <span className="text-rose-400">-{sk.gap}%</span>
                        ) : (
                          <span className="text-emerald-400">0%</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={isStrong ? 'emerald' : isWeak ? 'amber' : 'rose'}
                          size="sm"
                        >
                          {sk.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-foreground-muted text-[11px] max-w-xs">
                        {sk.recommended_action}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* 4-Phase Personalized Learning Roadmap */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Personalized 4-Phase Roadmap</h2>
            <p className="text-xs text-foreground-muted">Track your progress toward placement readiness</p>
          </div>
          <Badge variant="indigo">Action Milestones</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roadmap?.phases?.map((phase: any) => (
            <Card key={phase.phase} className="p-6 space-y-4 border-border bg-surface">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="cyan" size="sm">Phase {phase.phase} • {phase.timeline}</Badge>
                  <h3 className="text-sm font-bold text-foreground mt-2">{phase.title}</h3>
                  <p className="text-xs text-foreground-muted mt-1 leading-relaxed">{phase.description}</p>
                </div>
              </div>

              {/* Skills to learn */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {phase.skills_to_learn?.map((sk: string, i: number) => (
                  <Badge key={i} variant="muted" size="sm">{sk}</Badge>
                ))}
              </div>

              {/* Action items checklist */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <span className="text-[11px] font-bold text-foreground-muted uppercase tracking-wider">
                  Milestone Tasks:
                </span>
                {phase.action_items?.map((task: any, taskIdx: number) => {
                  const key = `phase_${phase.phase}_task_${taskIdx}`;
                  const isCompleted = !!roadmap?.progress_state?.[key];

                  return (
                    <div
                      key={taskIdx}
                      onClick={() => handleToggleTask(phase.phase, taskIdx, isCompleted)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        isCompleted
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-surface-elevated border-border text-foreground hover:bg-border/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => {}}
                        className="mt-0.5 h-4 w-4 rounded accent-emerald-500"
                      />
                      <div className="flex-1">
                        <span className={`text-xs block ${isCompleted ? 'line-through opacity-80' : ''}`}>
                          {task.title}
                        </span>
                        <span className="text-[10px] text-foreground-muted capitalize">Type: {task.type}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border text-[11px] text-foreground-muted">
                <strong className="text-foreground">Deliverable:</strong> {phase.deliverable}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
