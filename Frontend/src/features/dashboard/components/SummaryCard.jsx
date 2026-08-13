import React from 'react';
import { Cpu, Ticket } from 'lucide-react';

const CONFIG = {
  machines: {
    icon: Cpu,
    gradient: 'from-blue-500 to-blue-700',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-100 dark:border-blue-800/40',
    iconColor: 'text-blue-500',
    label: 'Terdaftar',
  },
  tickets: {
    icon: Ticket,
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-100 dark:border-amber-800/40',
    iconColor: 'text-amber-500',
    label: 'Sedang Aktif',
  },
};

const SummaryCard = ({ title, value, type = 'machines' }) => {
  const cfg = CONFIG[type] || CONFIG.machines;
  const Icon = cfg.icon;

  return (
    <div className={`rounded-2xl border p-6 flex items-center gap-5 bg-white dark:bg-stone-900 shadow-sm ${cfg.border} hover:shadow-md transition-shadow`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${cfg.gradient} text-white shadow-md shrink-0`}>
        <Icon size={28} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300">
          {title}
        </p>
        <p className="text-3xl font-black text-stone-900 dark:text-white mt-1 tracking-tight">
          {value !== undefined && value !== null ? value : 0}
        </p>
        <p className="text-[11px] text-stone-600 dark:text-stone-300 font-medium mt-0.5">
          {cfg.label}
        </p>
      </div>
    </div>
  );
};

export default SummaryCard;