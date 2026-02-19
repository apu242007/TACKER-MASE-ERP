import React from 'react';
import { ExpirationStatus } from '../types';

export const StatusBadge: React.FC<{ status?: ExpirationStatus; label?: string }> = ({ status, label }) => {
  if (!status) return <span className="text-slate-400">-</span>;

  let colorClass = 'bg-slate-100 text-slate-700';
  
  switch (status) {
    case 'VENCIDO':
      colorClass = 'bg-red-100 text-red-700 border border-red-200';
      break;
    case 'CRITICO':
      colorClass = 'bg-red-50 text-red-600 border border-red-200 font-bold animate-pulse';
      break;
    case 'POR_VENCER':
      colorClass = 'bg-amber-100 text-amber-700 border border-amber-200';
      break;
    case 'VIGENTE':
      colorClass = 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {label || status.replace('_', ' ')}
    </span>
  );
};