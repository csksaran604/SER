import React, { useState, useEffect } from 'react';
import {
  Download,
  Filter,
  BarChart3,
  Calendar,
  Clock,
  ShieldAlert,
  Ambulance,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { reportsApi } from '../services/api';
import { SeverityBadge } from '../components/SeverityBadge';

const SEVERITY_COLORS = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#f59e0b',
  Low: '#10b981',
};

export const ReportsPage = () => {
  const [accidentsData, setAccidentsData] = useState(null);
  const [severityData, setSeverityData] = useState([]);
  const [responseTimeData, setResponseTimeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [severity, setSeverity] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [responseStatus, setResponseStatus] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (severity) params.severity = severity;
      if (verificationStatus) params.verification_status = verificationStatus;
      if (responseStatus) params.response_status = responseStatus;

      const [accRes, sevRes, respRes] = await Promise.all([
        reportsApi.getAccidentsReport(params),
        reportsApi.getSeverityReport(params),
        reportsApi.getResponseTimeReport(params),
      ]);

      setAccidentsData(accRes.data);
      setSeverityData(sevRes.data.severity_distribution || []);
      setResponseTimeData(respRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate, severity, verificationStatus, responseStatus]);

  const handleExportCsv = () => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (severity) params.severity = severity;
    if (verificationStatus) params.verification_status = verificationStatus;
    if (responseStatus) params.response_status = responseStatus;

    const exportUrl = reportsApi.getExportCsvUrl(params);
    window.open(exportUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Safety Analytics & Operational Reports
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Audit logs, emergency dispatch turnaround KPIs, and exportable datasets
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Dataset (CSV)</span>
        </button>
      </div>

      {/* Filter Panel */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
        <div>
          <label className="block text-[10px] text-slate-400 uppercase mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] text-slate-400 uppercase mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] text-slate-400 uppercase mb-1">Severity</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
          >
            <option value="">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-400 uppercase mb-1">Verification</label>
          <select
            value={verificationStatus}
            onChange={(e) => setVerificationStatus(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
          >
            <option value="">All Verification</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-400 uppercase mb-1">Response</label>
          <select
            value={responseStatus}
            onChange={(e) => setResponseStatus(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
          >
            <option value="">All Response</option>
            <option value="Pending">Pending</option>
            <option value="Unit Assigned">Unit Assigned</option>
            <option value="Dispatched">Dispatched</option>
            <option value="En Route">En Route</option>
            <option value="On Scene">On Scene</option>
            <option value="Resolved">Resolved</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-[10px] uppercase font-mono text-slate-400">Total Filtered Incidents</p>
          <p className="text-2xl font-black text-white mt-1">{accidentsData?.total || 0}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-[10px] uppercase font-mono text-slate-400">Operator Verified</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{accidentsData?.summary?.verified || 0}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-[10px] uppercase font-mono text-slate-400">Operator Rejected</p>
          <p className="text-2xl font-black text-slate-400 mt-1">{accidentsData?.summary?.rejected || 0}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-[10px] uppercase font-mono text-slate-400">Pending Review</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{accidentsData?.summary?.pending || 0}</p>
        </div>
      </div>

      {/* Visual Charts: Severity Breakdown & Average Response Times */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <h2 className="text-sm font-bold text-white mb-1">Accident Severity Distribution</h2>
          <p className="text-xs text-slate-400 mb-4">Breakdown of reported incident severity</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="severity" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={SEVERITY_COLORS[entry.severity] || '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Times by Emergency Unit Type */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <h2 className="text-sm font-bold text-white mb-1">Average Dispatch Response Time (Minutes)</h2>
          <p className="text-xs text-slate-400 mb-4">Turnaround from assignment to active field dispatch</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responseTimeData?.response_times_by_type || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="unit_type" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="avg_dispatch_minutes" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Emergency Unit Fleet Usage Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <h2 className="text-sm font-bold text-white mb-1">Emergency Unit Fleet Utilization</h2>
        <p className="text-xs text-slate-400 mb-4">Cumulative assignment frequency per emergency vehicle</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="bg-slate-900/80 uppercase text-[10px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Unit ID</th>
                <th className="py-2.5 px-3">Vehicle Plate</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Total Assignments</th>
                <th className="py-2.5 px-3">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(responseTimeData?.unit_usage || []).map((u, i) => (
                <tr key={i} className="hover:bg-slate-800/20">
                  <td className="py-2.5 px-3 font-bold text-rose-400">{u.unit_id}</td>
                  <td className="py-2.5 px-3 text-slate-200">{u.vehicle_number}</td>
                  <td className="py-2.5 px-3">{u.type}</td>
                  <td className="py-2.5 px-3 font-bold">{u.total_assignments} missions</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                      {u.current_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
