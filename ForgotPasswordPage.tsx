import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Orbit, Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { api } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccessMessage(res.data?.message || 'Password reset link has been dispatched.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Orbit className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
            Reset Account Password
          </h2>
          <p className="text-xs text-foreground-muted">
            Enter your email to receive a secure password recovery token
          </p>
        </div>

        <Card className="p-8 shadow-2xl border-border bg-surface">
          {successMessage ? (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs text-foreground leading-relaxed">{successMessage}</p>
              <Link to="/login" className="inline-block">
                <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 rounded-xl bg-rose-500/10 text-xs text-rose-400 border border-rose-500/20">{error}</div>}
              
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-foreground-muted" />
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-elevated pl-10 pr-3.5 py-2 text-xs text-foreground placeholder-foreground-muted focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                className="w-full mt-2"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs text-foreground-muted hover:text-foreground">
                  Remember your password? Sign in
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
