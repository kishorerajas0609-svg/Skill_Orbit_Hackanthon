import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  requireOnboarding?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  requireOnboarding = true,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-4">
          <LoadingSkeleton className="h-10 w-3/4 mx-auto rounded-xl" />
          <LoadingSkeleton className="h-32 w-full rounded-2xl" />
          <LoadingSkeleton className="h-8 w-1/2 mx-auto rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if not onboarded yet and route requires it
  if (requireOnboarding && !user.is_onboarded && !location.pathname.includes('/onboarding')) {
    return <Navigate to={`/onboarding/${user.role}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-4 rounded-2xl border border-rose-500/20 bg-surface p-8 shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
          <p className="text-xs text-foreground-muted">
            This module requires an account with the role: <span className="font-semibold text-emerald-400">{allowedRoles.join(', ')}</span>.
            Your current role is <span className="font-semibold text-foreground">{user.role}</span>.
          </p>
          <a
            href={`/${user.role}/dashboard`}
            className="inline-block px-4 py-2 rounded-xl bg-surface-elevated text-foreground hover:bg-border text-xs font-semibold"
          >
            Return to My Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
