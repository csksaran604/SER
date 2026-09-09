import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { usersApi } from '../services/api';
import { formatDateTime } from '../utils/dateUtils';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchAction, setSearchAction] = useState('');
  const [searchUser, setSearchUser] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchAction) params.action = searchAction;
      if (searchUser) params.username = searchUser;

      const res = await usersApi.getAuditLogs(params);
      setLogs(res.data.audit_logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Security & Operational Audit Trails
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Immutable log of all user authentication, status transitions, and dispatch records
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleSearch} className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={searchAction}
            onChange={(e) => setSearchAction(e.target.value)}
            placeholder="Filter action (e.g. LOGIN, VERIFY_INCIDENT, ASSIGN_UNIT)..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
          />
        </div>
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            placeholder="Filter username..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 transition-colors"
        >
          Filter Logs
        </button>
      </form>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="bg-slate-900/80 uppercase text-[10px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Entity Ref</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No matching audit log records found.
                  </td>
                </tr>
              ) : (
                logs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {formatDateTime(item.created_at)}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-white whitespace-nowrap">
                      {item.username}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                        {item.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-300 whitespace-nowrap">{item.entity}</td>
                    <td className="py-2.5 px-4 text-rose-400 whitespace-nowrap font-bold">
                      {item.entity_id || '-'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {item.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 max-w-xs truncate font-sans text-xs">
                      {item.details || '-'}
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
