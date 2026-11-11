import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Building2, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const InstitutionOnboardingPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    institution_name: '',
    aishe_code: 'C-12345',
    university_affiliation: 'Autonomous Institute',
    institution_type: 'University / Autonomous',
    website: '',
    city: 'Hyderabad',
    state: 'Telangana',
    placement_officer_name: 'Dr. Placement Director',
    placement_officer_email: '',
    placement_officer_phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.institution_name) {
      setError('Please provide institution name.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await api.post('/institutions/onboarding', form);
      await refreshUser();
      navigate('/institution/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit institution profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="text-center space-y-2 mb-8">
        <Badge variant="indigo">Institution & College Portal</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          Configure Your Institution
        </h1>
        <p className="text-xs text-foreground-muted">
          Access aggregated student readiness metrics, department skill heatmaps, and placement pipelines.
        </p>
      </div>

      <Card className="p-8 shadow-2xl border-border bg-surface">
        {error && <div className="mb-6 p-3 rounded-xl bg-rose-500/10 text-xs text-rose-400 border border-rose-500/30">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Institution / College Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. National Institute of Technology"
              value={form.institution_name}
              onChange={(e) => setForm({ ...form, institution_name: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">AISHE / Institutional Code</label>
              <input
                type="text"
                placeholder="e.g. AISHE-C-45892"
                value={form.aishe_code}
                onChange={(e) => setForm({ ...form, aishe_code: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">University Affiliation</label>
              <input
                type="text"
                placeholder="e.g. Autonomous / State Technical University"
                value={form.university_affiliation}
                onChange={(e) => setForm({ ...form, university_affiliation: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">State</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Placement Officer Name</label>
              <input
                type="text"
                value={form.placement_officer_name}
                onChange={(e) => setForm({ ...form, placement_officer_name: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Official Website</label>
              <input
                type="url"
                placeholder="https://college.edu"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="w-full mt-4"
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Launch Institution Dashboard
          </Button>
        </form>
      </Card>
    </div>
  );
};
