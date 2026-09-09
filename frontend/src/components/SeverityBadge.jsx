import React from 'react';
import { AlertCircle, AlertTriangle, Info, Flame } from 'lucide-react';

export const SeverityBadge = ({ severity, size = 'sm', pulse = false }) => {
  const sev = severity || 'Medium';

  const configs = {
    Critical: {
      bg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      icon: Flame,
      dot: 'bg-rose-500',
    },
    High: {
      bg: 'bg-orange-500/15 border-orange-500/30 text-orange-300',
      icon: AlertCircle,
      dot: 'bg-orange-500',
    },
    Medium: {
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      icon: AlertTriangle,
      dot: 'bg-amber-500',
    },
    Low: {
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      icon: Info,
      dot: 'bg-emerald-500',
    },
  };

  const current = configs[sev] || configs.Medium;
  const Icon = current.icon;
  const isCritical = sev === 'Critical' || pulse;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border font-medium transition-all ${
        size === 'lg' ? 'text-sm py-1 px-3' : 'text-xs'
      } ${current.bg} ${isCritical ? 'animate-pulse' : ''}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
      <span>{sev}</span>
    </span>
  );
};
