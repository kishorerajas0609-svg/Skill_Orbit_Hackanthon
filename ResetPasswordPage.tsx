import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Orbit, Lock, Eye, EyeOff, Check, X, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [token, setToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[@#$%!&*_\-+=<>?]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('Password does not satisfy security requirements.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        email,
        token,
        new_password: newPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid or expired reset token.');
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
            Set New Password
          </h2>
          <p className="text-xs text-foreground-muted">
            Create a secure password for your SkillOrbit account
          </p>
        </div>

        <Card className="p-8 shadow-2xl border-border bg-surface">
          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Password Reset Complete</h3>
              <p className="text-xs text-foreground-muted">
                Your password has been successfully updated. You can now log in with your new credentials.
              </p>
              <Link to="/login" className="inline-block pt-2">
                <Button variant="primary" size="md">
                  Go to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 rounded-xl bg-rose-500/10 text-xs text-rose-400 border border-rose-500/20">{error}</div>}

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground">One-Time Reset Token</label>
                <input
                  type="text"
                  required
                  placeholder="Paste reset token from email"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-foreground-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-elevated pl-10 pr-10 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-foreground-muted hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                disabled={!isPasswordValid || newPassword !== confirmPassword}
                className="w-full mt-2"
              >
                Update Password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
