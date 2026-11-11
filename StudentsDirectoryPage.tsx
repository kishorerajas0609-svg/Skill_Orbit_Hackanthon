import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import {
  Users,
  GraduationCap,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const StudentsDirectoryPage: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.post('/recruiters/candidate-search', {});
      setCandidates(res.data?.candidates || []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const filtered = candidates.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(s) ||
      c.academic?.department?.toLowerCase().includes(s) ||
      c.skills?.some((sk: any) => sk.name.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Enrolled Students Directory</h1>
          <p className="text-xs text-foreground-muted">
            Inspect individual student Skill Passports, CGPA, and portfolio readiness.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Filter by name, dept, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface pl-9 pr-3 py-2 text-xs text-foreground focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <LoadingSkeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((cand, idx) => (
            <Card key={idx} hover className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-base overflow-hidden">
                    {cand.avatar_url ? (
                      <img src={cand.avatar_url} alt={cand.full_name} className="h-full w-full object-cover" />
                    ) : (
                      cand.full_name?.charAt(0).toUpperCase() || 'S'
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{cand.full_name}</h3>
                    <span className="text-xs text-foreground-muted block">
                      {cand.academic?.department || 'Engineering'} • Batch {cand.academic?.graduation_year || '2026'}
                    </span>
                  </div>
                </div>

                <Badge variant="emerald" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                  {cand.verified_skills_count} Verified
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-foreground-muted">
                <span className="font-semibold text-foreground">
                  CGPA: <strong className="text-emerald-400">{cand.academic?.cgpa || 'N/A'}</strong>
                </span>
                <span>•</span>
                <span>{cand.projects_count || 0} Projects Added</span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {cand.skills?.slice(0, 5).map((sk: any, i: number) => (
                  <Badge key={i} variant={sk.verified ? 'emerald' : 'muted'} size="sm">
                    {sk.name} ({sk.proficiency}%)
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No registered students found"
          description="When students register on SkillOrbit, their Skill Passports will appear in this directory."
        />
      )}
    </div>
  );
};
