import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/client';
import {
  User,
  Lock,
  Moon,
  Sun,
  Laptop,
  ShieldCheck,
  Camera,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Bell
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ImageCropperModal } from '../../components/ui/ImageCropperModal';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance' | 'privacy'>('profile');
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Password policy check
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[@#$%!&*_\-+=<>?]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setPasswordError('Password does not satisfy the security policy.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    setPasswordMessage('');

    try {
      const res = await api.post('/auth/change-password', {
        current_password: currentPassword || undefined,
        new_password: newPassword,
      });
      setPasswordMessage(res.data?.message || 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.detail || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="space-y-1 border-b border-border pb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Account & Security Settings</h1>
        <p className="text-xs text-foreground-muted">
          Manage your credentials, profile pictures, appearance preferences, and privacy controls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation Menu */}
        <div className="space-y-1 md:col-span-1">
          {[
            { key: 'profile', label: 'Profile & Avatar', icon: User },
            { key: 'security', label: 'Security & Password', icon: Lock },
            { key: 'appearance', label: 'Theme & Display', icon: Moon },
            { key: 'privacy', label: 'Privacy & Visibility', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-foreground-muted hover:text-foreground hover:bg-surface-elevated'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Content Panels */}
        <div className="md:col-span-3">
          {/* Profile & Avatar Tab */}
          {activeTab === 'profile' && (
            <Card className="p-6 space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-sm font-bold text-foreground">Profile Picture</h2>
                <p className="text-xs text-foreground-muted">Upload and crop a profile avatar</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="h-20 w-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-2xl overflow-hidden shadow-lg">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                    ) : (
                      user?.full_name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowPhotoModal(true)}
                    icon={<Camera className="w-3.5 h-3.5" />}
                  >
                    Upload New Photo
                  </Button>
                  <p className="text-[11px] text-foreground-muted">PNG, JPG, or WEBP up to 5MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <span className="text-[11px] text-foreground-muted block">Full Name</span>
                  <span className="text-xs font-semibold text-foreground">{user?.full_name}</span>
                </div>
                <div>
                  <span className="text-[11px] text-foreground-muted block">Email Address</span>
                  <span className="text-xs font-semibold text-foreground">{user?.email}</span>
                </div>
                <div>
                  <span className="text-[11px] text-foreground-muted block">Account Role</span>
                  <Badge variant="cyan" size="sm" className="capitalize mt-1">{user?.role}</Badge>
                </div>
                <div>
                  <span className="text-[11px] text-foreground-muted block">Account Status</span>
                  <Badge variant="emerald" size="sm" className="mt-1">Active</Badge>
                </div>
              </div>
            </Card>
          )}

          {/* Security & Password Tab */}
          {activeTab === 'security' && (
            <Card className="p-6 space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-sm font-bold text-foreground">Change Password</h2>
                <p className="text-xs text-foreground-muted">Enforce strong password policy standards</p>
              </div>

              {passwordMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 text-xs text-emerald-400 border border-emerald-500/30 font-semibold">
                  {passwordMessage}
                </div>
              )}
              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-500/10 text-xs text-rose-400 border border-rose-500/30 font-semibold">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                {user?.has_password !== false && (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-foreground">Current Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground">New Strong Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter new strong password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 text-foreground-muted hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {newPassword && (
                    <div className="mt-2 rounded-xl bg-surface-elevated p-3 border border-border space-y-1 text-[11px]">
                      <span className="block font-semibold text-foreground-muted mb-1">
                        Password Requirements:
                      </span>
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <span className={hasMinLength ? 'text-emerald-400' : 'text-foreground-muted'}>
                          {hasMinLength ? '✓' : '✕'} 8+ Characters
                        </span>
                        <span className={hasUppercase ? 'text-emerald-400' : 'text-foreground-muted'}>
                          {hasUppercase ? '✓' : '✕'} 1+ Uppercase
                        </span>
                        <span className={hasLowercase ? 'text-emerald-400' : 'text-foreground-muted'}>
                          {hasLowercase ? '✓' : '✕'} 1+ Lowercase
                        </span>
                        <span className={hasNumber ? 'text-emerald-400' : 'text-foreground-muted'}>
                          {hasNumber ? '✓' : '✕'} 1+ Number
                        </span>
                        <span className={`col-span-2 ${hasSpecial ? 'text-emerald-400' : 'text-foreground-muted'}`}>
                          {hasSpecial ? '✓' : '✕'} 1+ Special Symbol (@, #, $, %, !, &, *)
                        </span>
                      </div>
                    </div>
                  )}
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
                  loading={passwordLoading}
                  disabled={!isPasswordValid || newPassword !== confirmPassword}
                >
                  Update Password
                </Button>
              </form>
            </Card>
          )}

          {/* Theme & Display Tab */}
          {activeTab === 'appearance' && (
            <Card className="p-6 space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-sm font-bold text-foreground">Theme & Visual Mode</h2>
                <p className="text-xs text-foreground-muted">Choose your preferred visual presentation</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Deep black background with refined contrast' },
                  { key: 'light', label: 'Light Mode', icon: Sun, desc: 'Clean, high-visibility bright surfaces' },
                  { key: 'system', label: 'System Default', icon: Laptop, desc: 'Syncs automatically with operating system' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = theme === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setTheme(item.key as any)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm'
                          : 'border-border bg-surface-elevated text-foreground hover:bg-border/60'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-2" />
                      <span className="block text-xs font-bold">{item.label}</span>
                      <span className="block text-[10px] text-foreground-muted mt-1">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Privacy & Visibility Tab */}
          {activeTab === 'privacy' && (
            <Card className="p-6 space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-sm font-bold text-foreground">Privacy & Visibility</h2>
                <p className="text-xs text-foreground-muted">Control who can view your profile and verified Skill Passport</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface-elevated cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Recruiter Talent Discovery</span>
                    <span className="text-[11px] text-foreground-muted block mt-0.5">
                      Allow verified recruiters to find your profile during candidate searches
                    </span>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-emerald-500" />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface-elevated cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Institution Analytics Inclusion</span>
                    <span className="text-[11px] text-foreground-muted block mt-0.5">
                      Include aggregated placement metrics in your college dashboard
                    </span>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-emerald-500" />
                </label>
              </div>
            </Card>
          )}
        </div>
      </div>

      <ImageCropperModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onSuccess={(url) => {
          updateUser({ avatar_url: url });
        }}
      />
    </div>
  );
};
