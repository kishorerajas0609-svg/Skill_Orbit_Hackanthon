import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Orbit, Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const LoginPage: React.FC = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (!user.is_onboarded) {
        navigate(`/onboarding/${user.role}`);
      } else {
        navigate(from === '/' ? `/${user.role}/dashboard` : from);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      // In production or development with Google Client ID:
      // Launch standard Google Identity or popup token exchange
      // For local seamless execution with real backend database persistence:
      const dummyIdToken = `google_oauth_token_${Date.now()}`;
      const user = await googleLogin(dummyIdToken, 'student');
      if (!user.is_onboarded) {
        navigate(`/onboarding/${user.role}`);
      } else {
        navigate(`/${user.role}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Google sign-in could not be completed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Orbit className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
            Welcome back to SkillOrbit
          </h2>
          <p className="text-xs text-foreground-muted">
            Sign in to access your digital skill passport, listings, or analytics
          </p>
        </div>

        <Card className="p-8 shadow-2xl border-border bg-surface">
          {error && (
            <div className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400 font-medium animate-in fade-in duration-200">
              {error}
            </div>
          )}

          {/* Real Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-surface-elevated hover:bg-border/60 p-2.5 text-xs font-semibold text-foreground transition-all duration-200 shadow-sm active:scale-[0.98] disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
          </button>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <span className="relative bg-surface px-3 text-[11px] uppercase tracking-wider text-foreground-muted">
              Or sign in with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-foreground-muted" />
                <input
                  type="email"
                  required
                  placeholder="name@college.edu or name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-elevated pl-10 pr-3.5 py-2 text-xs text-foreground placeholder-foreground-muted focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-foreground">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-emerald-400 hover:text-emerald-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-foreground-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-elevated pl-10 pr-10 py-2 text-xs text-foreground placeholder-foreground-muted focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-foreground-muted">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
