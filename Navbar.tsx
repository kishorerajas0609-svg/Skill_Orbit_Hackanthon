import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Orbit,
  Sun,
  Moon,
  Laptop,
  Bell,
  User,
  LogOut,
  Settings,
  Briefcase,
  Award,
  BookOpen,
  LayoutDashboard,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Build role-specific navigation links
  const getNavLinks = () => {
    if (!user) {
      return [
        { label: 'Explore Opportunities', path: '/opportunities' },
        { label: 'For Institutions', path: '/#institutions' },
        { label: 'For Recruiters', path: '/#recruiters' },
      ];
    }

    switch (user.role) {
      case 'student':
        return [
          { label: 'Dashboard', path: '/student/dashboard' },
          { label: 'Explore Jobs', path: '/opportunities' },
          { label: 'Skill Passport', path: '/student/skill-passport' },
          { label: 'Assessments', path: '/student/assessments' },
          { label: 'Career Roadmap', path: '/student/roadmap' },
          { label: 'Applications', path: '/student/applications' },
        ];
      case 'recruiter':
        return [
          { label: 'Dashboard', path: '/recruiter/dashboard' },
          { label: 'Post Opportunity', path: '/recruiter/post-opportunity' },
          { label: 'Manage Listings', path: '/recruiter/manage-opportunities' },
          { label: 'Candidate Search', path: '/recruiter/candidates' },
        ];
      case 'institution':
        return [
          { label: 'Dashboard', path: '/institution/dashboard' },
          { label: 'Students Directory', path: '/institution/students' },
          { label: 'Explore Opportunities', path: '/opportunities' },
        ];
      case 'academician':
        return [
          { label: 'Dashboard', path: '/academician/dashboard' },
          { label: 'Industry Programs', path: '/academician/dashboard#programs' },
        ];
      case 'admin':
        return [
          { label: 'Admin Console', path: '/admin/dashboard' },
          { label: 'User Directory', path: '/admin/users' },
          { label: 'Opportunities', path: '/opportunities' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={user ? `/${user.role}/dashboard` : '/'} className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Orbit className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-foreground font-sans">SkillOrbit</span>
              <span className="hidden sm:inline-block rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                PROD
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20'
                    : 'text-foreground-muted hover:text-foreground hover:bg-surface-elevated'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Theme Switcher, Notifications, User Menu */}
        <div className="flex items-center gap-2.5">
          {/* Theme Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-elevated border border-transparent hover:border-border transition-colors"
              title="Switch theme"
            >
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : theme === 'light' ? <Sun className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
            </button>
            {showThemeMenu && (
              <div
                className="absolute right-0 mt-2 w-36 rounded-xl border border-border bg-surface p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowThemeMenu(false)}
              >
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
                    theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'text-foreground hover:bg-surface-elevated'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" /> Dark Mode
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
                    theme === 'light' ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'text-foreground hover:bg-surface-elevated'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" /> Light Mode
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
                    theme === 'system' ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'text-foreground hover:bg-surface-elevated'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" /> System Default
                </button>
              </div>
            )}
          </div>

          {/* Notifications Dropdown (Logged in only) */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-elevated border border-transparent hover:border-border transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-surface shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between p-3.5 border-b border-border bg-surface-elevated/50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">Notifications</span>
                      {unreadCount > 0 && <Badge variant="emerald" size="sm">{unreadCount} new</Badge>}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-border/50">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-foreground-muted">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n._id}
                          onClick={() => {
                            markAsRead(n._id);
                            if (n.action_url) navigate(n.action_url);
                            setShowNotifMenu(false);
                          }}
                          className={`p-3 text-left hover:bg-surface-elevated cursor-pointer transition-colors ${
                            !n.read ? 'bg-emerald-500/5' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className={`text-xs font-semibold ${!n.read ? 'text-emerald-400' : 'text-foreground'}`}>
                              {n.title}
                            </span>
                            {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1" />}
                          </div>
                          <p className="mt-1 text-[11px] text-foreground-muted line-clamp-2">{n.message}</p>
                          <span className="mt-1 block text-[10px] text-foreground-muted/60">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Account / Profile Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-xl p-1 hover:bg-surface-elevated border border-transparent hover:border-border transition-colors"
              >
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs overflow-hidden">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                  ) : (
                    user.full_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden lg:block text-left pr-1">
                  <span className="block text-xs font-semibold text-foreground leading-tight">{user.full_name}</span>
                  <span className="block text-[10px] text-foreground-muted capitalize">{user.role}</span>
                </div>
              </button>

              {showProfileMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-surface p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-border/60 mb-1">
                    <p className="text-xs font-bold text-foreground truncate">{user.full_name}</p>
                    <p className="text-[11px] text-foreground-muted truncate">{user.email}</p>
                    <Badge variant="cyan" size="sm" className="mt-1.5 capitalize">
                      {user.role}
                    </Badge>
                  </div>
                  <Link
                    to={user.role === 'student' ? '/student/profile' : '/settings'}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-foreground hover:bg-surface-elevated"
                  >
                    <User className="w-4 h-4 text-foreground-muted" /> My Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-foreground hover:bg-surface-elevated"
                  >
                    <Settings className="w-4 h-4 text-foreground-muted" /> Account Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-foreground hover:bg-surface-elevated border border-border transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 border border-emerald-500/30 transition-all"
              >
                Create Account
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-elevated border border-border"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface p-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-surface-elevated"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
