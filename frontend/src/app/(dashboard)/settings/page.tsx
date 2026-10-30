'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Settings,
  User,
  Mail,
  Lock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Palette,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { authAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface ProfileFormInputs {
  full_name: string;
}

interface PasswordFormInputs {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
  } = useForm<ProfileFormInputs>({
    defaultValues: {
      full_name: user?.full_name || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormInputs>();

  const newPasswordValue = watchPassword('new_password');

  const onUpdateProfile = async (data: ProfileFormInputs) => {
    setProfileSaving(true);
    setProfileSuccess(false);
    setProfileError(null);
    try {
      await authAPI.updateProfile({ full_name: data.full_name });
      await refreshUser();
      setProfileSuccess(true);
    } catch (err: any) {
      setProfileError('Failed to update profile information.');
    } finally {
      setProfileSaving(false);
    }
  };

  const onChangePassword = async (data: PasswordFormInputs) => {
    setPasswordSaving(true);
    setPasswordSuccess(false);
    setPasswordError(null);
    try {
      if (user?.email) {
        try {
          await authAPI.login({ email: user.email, password: data.current_password });
        } catch {
          throw new Error('Current password does not match account records.');
        }
      }
      await authAPI.updateProfile({ password: data.new_password });
      setPasswordSuccess(true);
      resetPassword();
    } catch (err: any) {
      setPasswordError(
        err?.message || err?.response?.data?.detail || 'Failed to change password. Please verify current credentials.'
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-50 tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-violet-400" />
          <span>Security & Account Settings</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage your analyst identity credentials, security parameters, and workspace preferences.
        </p>
      </div>

      {/* Profile Info Card */}
      <div className="glass-card p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Profile Information</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Personal identity linked to your cryptographic verification signatures
          </p>
        </div>

        {profileSuccess && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile updated successfully.</span>
          </div>
        )}

        {profileError && (
          <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                defaultValue={user?.full_name || ''}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-100 focus:outline-none focus:border-violet-500"
                {...registerProfile('full_name', { required: true })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                Primary verified authentication email
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>Joined: {formatDate(user?.created_at || '2024-01-01')}</span>
              <Badge variant={user?.role === 'admin' ? 'violet' : 'default'} size="sm">
                {user?.role?.toUpperCase() || 'USER'} ROLE
              </Badge>
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="btn-primary py-2 px-5 text-xs font-semibold flex items-center gap-2"
            >
              {profileSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="glass-card p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-violet-400" />
            <span>Update Password</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Ensure your account uses a high-entropy password to protect forensic custody trails
          </p>
        </div>

        {passwordSuccess && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Password updated successfully.</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-100 focus:outline-none focus:border-violet-500"
              {...registerPassword('current_password', { required: 'Current password is required' })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-100 focus:outline-none focus:border-violet-500"
                {...registerPassword('new_password', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' },
                })}
              />
              {passwordErrors.new_password && (
                <p className="text-xs text-red-400 mt-1">{passwordErrors.new_password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-100 focus:outline-none focus:border-violet-500"
                {...registerPassword('confirm_password', {
                  required: 'Confirm password is required',
                  validate: (v) => v === newPasswordValue || 'Passwords do not match',
                })}
              />
              {passwordErrors.confirm_password && (
                <p className="text-xs text-red-400 mt-1">
                  {passwordErrors.confirm_password.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordSaving}
              className="btn-primary py-2 px-5 text-xs font-semibold flex items-center gap-2"
            >
              {passwordSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>

      {/* Theme & Display Preferences (Future / Config) */}
      <div className="glass-card p-6 sm:p-8 space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
            <Palette className="w-4 h-4 text-cyan-400" />
            <span>Theme & Display Preferences</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Default interface colors and visual density for forensic visualization
          </p>
        </div>

        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-sm font-semibold text-gray-200">Cyber Dark Mode</span>
            <p className="text-xs text-gray-500">
              High-contrast deep navy (#0a0e1a) with electric violet and cyan accents
            </p>
          </div>
          <Badge variant="violet">ACTIVE (HARDENED)</Badge>
        </div>
      </div>
    </div>
  );
}
