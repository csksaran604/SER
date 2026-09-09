import React from 'react';
import { CheckCircle2, Clock, XCircle, Navigation, Siren, ShieldCheck } from 'lucide-react';

export const StatusBadge = ({ status, type = 'response' }) => {
  const s = status || 'Pending';

  if (type === 'verification') {
    const vConfigs = {
      Verified: {
        bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
        icon: ShieldCheck,
      },
      Pending: {
        bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
        icon: Clock,
      },
      Rejected: {
        bg: 'bg-slate-500/20 border-slate-600/40 text-slate-400',
        icon: XCircle,
      },
    };
    const current = vConfigs[s] || vConfigs.Pending;
    const Icon = current.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium ${current.bg}`}>
        <Icon className="w-3 h-3" />
        {s}
      </span>
    );
  }

  // Response Status
  const rConfigs = {
    Pending: {
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      icon: Clock,
    },
    'Unit Assigned': {
      bg: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
      icon: Siren,
    },
    Dispatched: {
      bg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
      icon: Navigation,
    },
    'En Route': {
      bg: 'bg-blue-500/20 border-blue-500/40 text-blue-300 animate-pulse',
      icon: Navigation,
    },
    'On Scene': {
      bg: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
      icon: Siren,
    },
    Resolved: {
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      icon: CheckCircle2,
    },
    Cancelled: {
      bg: 'bg-slate-500/20 border-slate-600/40 text-slate-400',
      icon: XCircle,
    },
  };

  const current = rConfigs[s] || rConfigs.Pending;
  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium ${current.bg}`}>
      <Icon className="w-3 h-3" />
      {s}
    </span>
  );
};
