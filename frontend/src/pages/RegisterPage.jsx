import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Radio, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'EMERGENCY_OPERATOR',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 items-center justify-center shadow-xl shadow-rose-950/50 mb-3">
            <Radio className="w-6 h-6 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Personnel Enlistment</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Smart Emergency Response Platform</p>
        </div>

        {/* Register Card */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. Officer Sarah Jenkins"
                className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-rose-500 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="sarah_j"
                  className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-rose-500 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Assigned Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-rose-500 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none transition-all font-mono"
                >
                  <option value="EMERGENCY_OPERATOR">OPERATOR</option>
                  <option value="VIEWER">VIEWER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                Official Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sarah.jenkins@emergency.system"
                className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-rose-500 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                Security Password (min 6 characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-rose-500 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-sm font-bold tracking-wide shadow-lg shadow-rose-900/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? 'Creating Credentials...' : 'Register Operator Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-xs text-slate-400 hover:text-white transition-colors">
              Already enrolled? <span className="text-rose-400 underline">Log in to terminal</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
