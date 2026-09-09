import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  UserX,
  RefreshCw,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/dateUtils';

export const UsersPage = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [_roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getUsers();
      setUsers(res.data.users || []);
      setRoles(res.data.roles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await usersApi.updateUserRole(userId, { role: newRole });
      setMessage(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Role update failed');
    }
  };

  const handleToggleActive = async (targetUser) => {
    try {
      await usersApi.updateUserRole(targetUser.id, {
        role: targetUser.role,
        is_active: !targetUser.is_active,
      });
      setMessage(`User ${targetUser.username} status toggled`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Status toggle failed');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.id === currentAdmin.id) {
      alert('Cannot delete your own active administrator account');
      return;
    }
    if (!window.confirm(`Confirm deletion of user ${targetUser.username}?`)) return;

    try {
      await usersApi.deleteUser(targetUser.id);
      setMessage(`User ${targetUser.username} removed`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            System User Governance
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Role-based access control and security authorization terminal
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-xs text-indigo-300 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-indigo-400 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Last Authentication</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading user records...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 font-sans">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-white text-xs">{u.full_name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{u.username}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300 text-xs">{u.email}</td>
                    <td className="py-3 px-4 font-mono">
                      <select
                        value={u.role || 'VIEWER'}
                        disabled={u.id === currentAdmin.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none disabled:opacity-50"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="EMERGENCY_OPERATOR">EMERGENCY_OPERATOR</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <button
                        onClick={() => handleToggleActive(u)}
                        disabled={u.id === currentAdmin.id}
                        className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase transition-colors ${
                          u.is_active
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-xs">
                      {u.last_login ? formatDateTime(u.last_login) : 'Never'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.id !== currentAdmin.id && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
