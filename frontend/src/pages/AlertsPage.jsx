import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Shield,
  Clock,
  Radio,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { notificationsApi } from '../services/api';
import { formatDateTime } from '../utils/dateUtils';

export const AlertsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filterSeverity) params.severity = filterSeverity;
      if (filterUnreadOnly) params.unread = true;

      const res = await notificationsApi.getNotifications(params);
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filterSeverity, filterUnreadOnly]);

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Emergency Alert Center
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time in-app notification dispatch log for AI detections and tactical escalations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAlerts}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs font-mono">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={filterUnreadOnly}
              onChange={(e) => setFilterUnreadOnly(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-rose-600 focus:ring-0"
            />
            <span>Unread Only ({unreadCount})</span>
          </label>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-slate-200 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warnings</option>
            <option value="info">Informational</option>
          </select>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Showing {notifications.length} alerts
        </span>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs glass-panel rounded-2xl border border-slate-800">
            Loading alerts...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs glass-panel rounded-2xl border border-slate-800">
            No alerts matching the selected filters.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`glass-panel p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                n.is_read
                  ? 'border-slate-800/60 opacity-70 bg-slate-900/30'
                  : n.severity === 'critical'
                  ? 'border-rose-500/40 bg-rose-500/5 shadow-md shadow-rose-950/20'
                  : n.severity === 'warning'
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    n.severity === 'critical'
                      ? 'bg-rose-500/20 text-rose-400'
                      : n.severity === 'warning'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-indigo-500/20 text-indigo-400'
                  }`}
                >
                  {n.severity === 'critical' ? (
                    <Flame className="w-5 h-5" />
                  ) : n.severity === 'warning' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Radio className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-bold text-white tracking-wide">{n.title}</h3>
                    <span
                      className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded border font-bold ${
                        n.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : n.severity === 'warning'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      }`}
                    >
                      {n.severity}
                    </span>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </div>

                  <p className="text-xs text-slate-300 mt-1">{n.message}</p>

                  <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {formatDateTime(n.created_at)}
                    </span>
                    {n.incident_code && (
                      <span className="text-rose-400 font-bold">
                        Ref: {n.incident_code}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {n.incident_id && (
                  <Link
                    to={`/incidents/${n.incident_id}`}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 border border-slate-700 transition-colors"
                  >
                    <span>View Incident</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}

                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-400 border border-slate-700 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
