import React, { useState } from 'react';
import { User, Lock, Mail, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { formatDate, formatDateTime } from '../utils/dateUtils';

export const ProfilePage = () => {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }

    setSavingPassword(true);
    try {
      await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordMsg({ text: 'Password successfully updated.', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({
        text: err.response?.data?.error || 'Failed to change password.',
        type: 'error',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          Officer / Operator Profile
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Manage credentials, clearance level, and terminal account parameters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Details */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-slate-800 pb-2">
            Active Credentials
          </h2>

          <div className="flex items-center gap-4 py-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white text-xl font-bold font-mono shadow-xl shadow-rose-950/40">
              {user?.username ? user.username.slice(0, 2).toUpperCase() : 'OP'}
            </div>
            <div>
              <p className="text-base font-bold text-white">{user?.full_name}</p>
              <p className="text-xs text-slate-400 font-mono">@{user?.username}</p>
              <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold uppercase">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Official Email</span>
              <span className="text-slate-200">{user?.email}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Account Created</span>
              <span className="text-slate-200">
                {user?.created_at ? formatDate(user.created_at) : 'Active'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Last Session Authentication</span>
              <span className="text-slate-200">
                {user?.last_login ? formatDateTime(user.last_login) : 'Current Active Session'}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-slate-800 pb-2">
            Update Password
          </h2>

          {passwordMsg.text && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                passwordMsg.type === 'error'
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {passwordMsg.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3 text-xs font-mono">
            <div>
              <label className="block text-[10px] uppercase text-slate-400 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-slate-400 mb-1">
                New Security Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-slate-400 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all disabled:opacity-50 mt-4"
            >
              {savingPassword ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
