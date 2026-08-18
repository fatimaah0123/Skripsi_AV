import React from 'react';

const STATUS_CONFIG = {
  WaitingAssignment: {
    label: 'Belum Ditugaskan',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/40',
    dot: 'bg-yellow-500',
  },
  Assigned: {
    label: 'Ditugaskan',
    className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/40',
    dot: 'bg-cyan-500',
  },
  InProgress: {
    label: 'Sedang Dikerjakan',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/40',
    dot: 'bg-blue-500 animate-pulse',
  },
  WaitingApproval: {
    label: 'Menunggu Approval',
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800/40',
    dot: 'bg-orange-500',
  },
  // GANTI: RevisionRequired -> Rejected (sesuai enum status backend)
  Rejected: {
    label: 'Ditolak / Perlu Revisi',
    className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
    dot: 'bg-rose-500',
  },
  Done: {
    label: 'Selesai',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/40',
    dot: 'bg-green-500',
  },
};

const FALLBACK = {
  label: 'Unknown',
  className: 'bg-stone-100 text-stone-600 border-stone-200',
  dot: 'bg-stone-400',
};

const TicketStatusBadge = ({ status, size = 'md' }) => {
  const cfg = STATUS_CONFIG[status] || FALLBACK;
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${textSize} ${cfg.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export default TicketStatusBadge;