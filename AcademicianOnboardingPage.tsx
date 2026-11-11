import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Users, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const AcademicianOnboardingPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    institution_name: '',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor',
    qualifications: 'Ph.D. in Computer Science',
    research_interests: ['Machine Learning', 'Cloud Computing', 'Data Mining'],
    courses_taught: ['Data Structures & Algorithms', 'Database Systems'],
    industry_experience_years: 5,
    mentorship_available: true,
    bio: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.institution_name) {
      setError('Please provide your affiliated institution/college.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await api.post('/academicians/onboarding', form);
      await refreshUser();
      navigate('/academician/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to complete faculty profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="text-center space-y-2 mb-8">
        <Badge variant="amber">Faculty & Academician Setup</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          Faculty Collaboration Profile
        </h1>
        <p className="text-xs text-foreground-muted">
          Connect with industry for Faculty Development Programs (FDPs), consultancy, and research initiatives.
        </p>
      </div>

      <Card className="p-8 shadow-2xl border-border bg-surface">
        {error && <div className="mb-6 p-3 rounded-xl bg-rose-500/10 text-xs text-rose-400 border border-rose-500/30">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Affiliated Institution Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. National Institute of Technology"
              value={form.institution_name}
              onChange={(e) => setForm({ ...form, institution_name: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Department</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Designation</label>
              <input
                type="text"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Highest Qualifications</label>
            <input
              type="text"
              placeholder="e.g. Ph.D. in Artificial Intelligence"
              value={form.qualifications}
              onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Short Bio & Academic Background</label>
            <textarea
              rows={3}
              placeholder="Brief summary of research areas, key publications, or courses taught..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-amber-500 focus:outline-none"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="w-full mt-4"
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Complete Faculty Setup
          </Button>
        </form>
      </Card>
    </div>
  );
};
