import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const RecruiterOnboardingPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    company_name: '',
    company_website: '',
    company_logo_url: '',
    industry: 'Software & Technology',
    company_size: '51-200',
    headquarters: 'Bengaluru, India',
    cin_or_reg_number: '',
    description: '',
    position_title: 'Talent Acquisition Lead',
    department: 'Engineering Recruitment',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name) {
      setError('Please provide your company name.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await api.post('/recruiters/onboarding', form);
      await refreshUser();
      navigate('/recruiter/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit recruiter profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="text-center space-y-2 mb-8">
        <Badge variant="cyan">Recruiter & Industry Setup</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          Set Up Your Company Profile
        </h1>
        <p className="text-xs text-foreground-muted">
          Your profile will be submitted for verification so you can publish jobs and browse verified candidate portfolios.
        </p>
      </div>

      <Card className="p-8 shadow-2xl border-border bg-surface">
        {error && <div className="mb-6 p-3 rounded-xl bg-rose-500/10 text-xs text-rose-400 border border-rose-500/30">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Technologies Pvt Ltd"
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Industry / Sector</label>
              <select
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
              >
                <option>Software & Technology</option>
                <option>Fintech & Banking</option>
                <option>Healthcare & Biotech</option>
                <option>E-Commerce & Retail</option>
                <option>Consulting & Analytics</option>
                <option>Automotive & IoT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Company Website</label>
              <input
                type="url"
                placeholder="https://company.com"
                value={form.company_website}
                onChange={(e) => setForm({ ...form, company_website: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Headquarters Location</label>
              <input
                type="text"
                placeholder="e.g. Bengaluru, Karnataka"
                value={form.headquarters}
                onChange={(e) => setForm({ ...form, headquarters: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Your Role / Designation</label>
              <input
                type="text"
                placeholder="e.g. Lead Technical Recruiter"
                value={form.position_title}
                onChange={(e) => setForm({ ...form, position_title: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Company Size</label>
              <select
                value={form.company_size}
                onChange={(e) => setForm({ ...form, company_size: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
              >
                <option>1-10 Employees (Early Stage)</option>
                <option>11-50 Employees</option>
                <option>51-200 Employees</option>
                <option>201-500 Employees</option>
                <option>500+ Enterprise</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Company Description</label>
            <textarea
              rows={3}
              placeholder="Tell candidates about your mission, product stack, and culture..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
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
            Submit for Recruiter Verification & Open Dashboard
          </Button>
        </form>
      </Card>
    </div>
  );
};
