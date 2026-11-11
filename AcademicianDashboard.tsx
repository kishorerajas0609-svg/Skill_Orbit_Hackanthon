import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import {
  Users,
  BookOpen,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  Building2,
  ExternalLink,
  Sparkles,
  Award
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const AcademicianDashboard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProgram, setNewProgram] = useState({
    title: '',
    type: 'Faculty Development Program (FDP)',
    organizer: '',
    description: '',
    duration: '2 Weeks (40 Hours)',
    mode: 'Online / Hybrid',
    deadline: '2026-11-15',
  });
  const [creating, setCreating] = useState(false);
  const [appliedProgramId, setAppliedProgramId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profRes, progRes] = await Promise.all([
        api.get('/academicians/profile'),
        api.get('/academicians/programs'),
      ]);
      setProfile(profRes.data?.profile);
      setPrograms(progRes.data?.programs || []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgram.title.trim()) return;
    setCreating(true);

    try {
      await api.post('/academicians/programs', newProgram);
      setShowCreateModal(false);
      setNewProgram({
        title: '',
        type: 'Faculty Development Program (FDP)',
        organizer: '',
        description: '',
        duration: '2 Weeks (40 Hours)',
        mode: 'Online / Hybrid',
        deadline: '2026-11-15',
      });
      await fetchData();
    } catch (e) {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  const handleApply = async (progId: string) => {
    try {
      await api.post(`/academicians/programs/${progId}/apply`);
      setAppliedProgramId(progId);
      setTimeout(() => setAppliedProgramId(null), 3000);
      await fetchData();
    } catch (e) {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-28 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => <LoadingSkeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl border border-border bg-gradient-to-r from-amber-950/40 via-surface to-indigo-950/30 p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-400">Academician Portal</span>
              <Badge variant="amber" size="sm">Industry Collaboration</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Welcome, {profile?.full_name || 'Professor'}
            </h1>
            <p className="text-xs sm:text-sm text-foreground-muted max-w-xl">
              {profile?.designation || 'Faculty'} • {profile?.department || 'Department'} • {profile?.institution_name || 'Academic Partner'}
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Create Collaboration Initiative
          </Button>
        </div>
      </div>

      {/* Programs & FDPs Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Industry Faculty Development & Research Programs</h2>
            <p className="text-xs text-foreground-muted">Live initiatives bridging academic faculty with real enterprise R&D</p>
          </div>
          <Badge variant="amber">{programs.length} Active</Badge>
        </div>

        {programs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programs.map((prog) => (
              <Card key={prog._id} hover className="p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="amber" size="sm">{prog.type}</Badge>
                      <h3 className="text-base font-bold text-foreground mt-1.5">{prog.title}</h3>
                    </div>
                    <Badge variant="muted" size="sm">{prog.mode}</Badge>
                  </div>

                  <p className="text-xs text-foreground-muted leading-relaxed line-clamp-3">
                    {prog.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-muted pt-2 border-t border-border/60">
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <Building2 className="w-3.5 h-3.5 text-amber-400" /> {prog.organizer || 'Industry Partner'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {prog.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-400" /> {prog.applicants?.length || 0} Faculty Registered
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <span className="text-[11px] text-foreground-muted">Deadline: {prog.deadline}</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApply(prog._id)}
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    {appliedProgramId === prog._id ? 'Registered!' : 'Express Interest'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen className="w-6 h-6" />}
            title="No faculty programs published yet"
            description="Create a faculty development, guest lecture, or research collaboration initiative."
            actionText="Create Collaboration Initiative"
            onAction={() => setShowCreateModal(true)}
          />
        )}
      </div>

      {/* Create Program Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Collaboration Program"
        description="Launch a Faculty Development Program, Industrial Training, or Research project."
      >
        <form onSubmit={handleCreateProgram} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Program Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Applied Generative AI in Curriculum Design"
              value={newProgram.title}
              onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Program Type</label>
              <select
                value={newProgram.type}
                onChange={(e) => setNewProgram({ ...newProgram, type: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-amber-500 focus:outline-none"
              >
                <option>Faculty Development Program (FDP)</option>
                <option>Industrial Training</option>
                <option>Research Collaboration</option>
                <option>Consultancy Project</option>
                <option>Guest Lecture Series</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Organizer / Partner</label>
              <input
                type="text"
                placeholder="e.g. SkillOrbit Industry Lab"
                value={newProgram.organizer}
                onChange={(e) => setNewProgram({ ...newProgram, organizer: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Description & Objectives</label>
            <textarea
              rows={3}
              required
              placeholder="Outline what participating academicians and industry mentors will collaborate on..."
              value={newProgram.description}
              onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={creating}>
              Create Program
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
