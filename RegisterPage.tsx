import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Orbit,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  GraduationCap,
  Building2,
  Users,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const RegisterPage: React.FC = () => {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Real-time password strength checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@#$%!&*_\-+=<>?]/.test(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const isPasswordValid =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  const rolesConfig: Array<{ role: UserRole; title: string; desc: string; icon: any }> = [
    {
      role: 'student',
      title: 'Student',
      desc: 'Build Skill Passport & get hired',
      icon: GraduationCap,
    },
    {
      role: 'recruiter',
      title: 'Recruiter',
      desc: 'Publish jobs & hire verified talent',
      icon: Building2,
    },
    {
      role: 'institution',
      title: 'College / Inst.',
      desc: 'Placement & skill analytics',
      icon: Building2,
    },
    {
      role: 'academician',
      title: 'Academician',
      desc: 'FDPs & research collaboration',
      icon: Users,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('Please ensure your password meets all the security requirements below.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const newUser = await register(email, password, fullName, role);
      navigate(`/onboarding/${newUser.role}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const dummyIdToken = `google_oauth_token_${Date.now()}`;
      const newUser = await googleLogin(dummyIdToken, role);
      if (!newUser.is_onboarded) {
        navigate(`/onboarding/${newUser.role}`);
      } else {
        navigate(`/${newUser.role}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Google sign-up could not be completed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Orbit className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
            Create your SkillOrbit Account
          </h2>
          <p className="text-xs text-foreground-muted">
            Join the verified platform connecting students, colleges, and recruiters
          </p>
        </div>

        <Card className="p-8 shadow-2xl border-border bg-surface">
          {error && (
            <div className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400 font-medium animate-in fade-in duration-200">
              {error}
            </div>
          )}

          {/* 1. Select Role */}
          <div className="space-y-2 mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
              Select Your Platform Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {rolesConfig.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => setRole(r.role)}
                    className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold shadow-sm'
                        : 'border-border bg-surface-elevated text-foreground-muted hover:text-foreground hover:bg-border/40'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5" />
                    <span className="text-xs">{r.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Google Sign-In */}
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
            {googleLoading ? 'Connecting...' : `Sign up as ${role.charAt(0).toUpperCase() + role.slice(1)} with Google`}
          </button>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <span className="relative bg-surface px-3 text-[11px] uppercase tracking-wider text-foreground-muted">
              Or register with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">
                {role === 'institution' ? 'Institution Name' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-foreground-muted" />
                <input
                  type="text"
                  required
                  placeholder={role === 'institution' ? 'e.g. National Institute of Technology' : 'John Doe'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-elevated pl-10 pr-3.5 py-2 text-xs text-foreground placeholder-foreground-muted focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Email Address</label>
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

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-foreground-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Create a strong password"
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

              {/* Real-time Password Strength Requirements */}
              {password && (
                <div className="mt-2 rounded-xl bg-surface-elevated/70 p-3 border border-border/80 space-y-1 text-[11px]">
                  <span className="block font-semibold text-foreground-muted mb-1">
                    Password Requirements:
                  </span>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <span className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-foreground-muted'}`}>
                      {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 8+ Characters
                    </span>
                    <span className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-400' : 'text-foreground-muted'}`}>
                      {hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 1+ Uppercase Letter
                    </span>
                    <span className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-400' : 'text-foreground-muted'}`}>
                      {hasLowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 1+ Lowercase Letter
                    </span>
                    <span className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-foreground-muted'}`}>
                      {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 1+ Number
                    </span>
                    <span className={`flex items-center gap-1.5 col-span-2 ${hasSpecial ? 'text-emerald-400' : 'text-foreground-muted'}`}>
                      {hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 1+ Special Symbol (@, #, $, %, !, &, *)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-foreground-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-elevated pl-10 pr-3.5 py-2 text-xs text-foreground placeholder-foreground-muted focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-[10px] text-rose-400 mt-1">Passwords do not match.</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              disabled={!isPasswordValid || !passwordsMatch}
              className="w-full mt-3"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Onboarding
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-foreground-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
