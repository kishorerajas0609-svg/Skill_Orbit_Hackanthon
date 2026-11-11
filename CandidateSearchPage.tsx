import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import {
  Search,
  Users,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  ExternalLink,
  MapPin,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const CandidateSearchPage: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [skill, setSkill] = useState('');
  const [minProficiency, setMinProficiency] = useState<number>(60);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [department, setDepartment] = useState('');
  const [minCgpa, setMinCgpa] = useState<number>(0);

  useEffect(() => {
    handleSearch();
  }, [verifiedOnly]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/recruiters/candidate-search', {
        skill: skill || undefined,
        min_proficiency: minProficiency,
        verified_only: verifiedOnly,
        department: department || undefined,
        min_cgpa: minCgpa > 0 ? minCgpa : undefined,
      });
      setCandidates(res.data?.candidates || []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="space-y-2 border-b border-border pb-6">
        <Badge variant="cyan">Talent Discovery Engine</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          Search Verified Student Talent
        </h1>
        <p className="text-xs sm:text-sm text-foreground-muted max-w-2xl">
          Discover students with verified Skill Passports, live GitHub repositories, and proven assessment scores.
        </p>

        {/* Filter Controls */}
        <form onSubmit={handleSearch} className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-foreground-muted">Skill Name</label>
            <input
              type="text"
              placeholder="e.g. React, Python, SQL"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-foreground-muted">Department</label>
            <input
              type="text"
              placeholder="e.g. Computer Science"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-foreground-muted">Min CGPA ({minCgpa || 'Any'})</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="10"
              value={minCgpa}
              onChange={(e) => setMinCgpa(parseFloat(e.target.value) || 0)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-surface text-xs text-foreground cursor-pointer w-full h-[38px]">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded accent-cyan-500"
              />
              <span className="text-[11px] font-semibold">Verified Skills Only</span>
            </label>
          </div>

          <div className="flex items-end">
            <Button type="submit" variant="primary" size="md" className="w-full h-[38px]" icon={<Search className="w-4 h-4" />}>
              Find Talent
            </Button>
          </div>
        </form>
      </div>

      {/* Candidate Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <LoadingSkeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : candidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {candidates.map((cand, idx) => (
            <Card key={idx} hover className="p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-base overflow-hidden">
                      {cand.avatar_url ? (
                        <img src={cand.avatar_url} alt={cand.full_name} className="h-full w-full object-cover" />
                      ) : (
                        cand.full_name?.charAt(0).toUpperCase() || 'S'
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{cand.full_name}</h3>
                      <span className="text-xs text-foreground-muted block">
                        {cand.academic?.department || 'Computer Science'} • {cand.academic?.institution_name || 'Partner College'}
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
                  <span>Batch of {cand.academic?.graduation_year || '2026'}</span>
                  <span>•</span>
                  <span>{cand.projects_count || 0} Projects</span>
                </div>

                {/* Skill Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cand.skills?.slice(0, 5).map((sk: any, i: number) => (
                    <Badge
                      key={i}
                      variant={sk.verified ? 'emerald' : 'muted'}
                      size="sm"
                      icon={sk.verified ? <ShieldCheck className="w-2.5 h-2.5" /> : undefined}
                    >
                      {sk.name} ({sk.proficiency}%)
                    </Badge>
                  ))}
                  {cand.skills?.length > 5 && (
                    <span className="text-[10px] text-foreground-muted self-center">
                      +{cand.skills.length - 5} more
                    </span>
                  )}
                </div>

                {cand.bio && (
                  <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                    "{cand.bio}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                <div className="flex items-center gap-3">
                  {cand.github_url && (
                    <a
                      href={cand.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> GitHub
                    </a>
                  )}
                  {cand.linkedin_url && (
                    <a
                      href={cand.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> LinkedIn
                    </a>
                  )}
                </div>

                <Badge variant="cyan" size="sm">Available for Hire</Badge>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No candidates matched your search"
          description="Try broadening your skill criteria or lowering proficiency threshold."
          actionText="Reset Filters"
          onAction={() => {
            setSkill('');
            setDepartment('');
            setMinCgpa(0);
            setVerifiedOnly(false);
            handleSearch();
          }}
        />
      )}
    </div>
  );
};
