import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { AssessmentCategory } from '../../types';
import { Award, Clock, FileQuestion, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const AssessmentsPage: React.FC = () => {
  const [categories, setCategories] = useState<AssessmentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/assessments/categories');
      setCategories(res.data?.categories || []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <LoadingSkeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="space-y-2 border-b border-border pb-6">
        <div className="flex items-center gap-2">
          <Badge variant="emerald">Proctored Skill Verification</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          Verified Technical Skill Assessments
        </h1>
        <p className="text-xs sm:text-sm text-foreground-muted max-w-2xl">
          Complete timed technical assessments evaluated directly by backend scoring algorithms. Scoring 60%+ automatically attaches a verified credential badge to your Skill Passport.
        </p>
      </div>

      {/* Assessment Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <Card key={cat.category} hover className="p-6 flex flex-col justify-between space-y-4 border-border">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <Badge variant="emerald" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                  Verifiable Badge
                </Badge>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground">{cat.title}</h3>
                <p className="mt-1 text-xs text-foreground-muted leading-relaxed">{cat.description}</p>
              </div>

              <div className="flex items-center gap-4 text-xs text-foreground-muted pt-2 border-t border-border/60">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" /> {cat.duration_minutes} Mins
                </span>
                <span className="flex items-center gap-1.5">
                  <FileQuestion className="w-3.5 h-3.5 text-cyan-400" /> {cat.questions_count} Questions
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Pass: 60%
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/student/assessments/test/${encodeURIComponent(cat.category)}`)}
              className="w-full"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Start Timed Test
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
