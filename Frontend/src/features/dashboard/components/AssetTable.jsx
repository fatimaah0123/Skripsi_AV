import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, Wrench, Filter } from 'lucide-react';

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', order: 0, style: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  warning:  { label: 'Warning',  order: 1, style: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  normal:   { label: 'Normal',   order: 2, style: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

const normalizeSeverity = (raw) => {
  const s = String(raw || '').trim().toLowerCase();
  if (s === 'h' || s.startsWith('high') || s.startsWith('crit')) return 'critical';
  if (s === 'm' || s.startsWith('med') || s.startsWith('warn')) return 'warning';
  return 'normal';
};

const SeverityBadge = ({ priority }) => {
  const key = normalizeSeverity(priority);
  const cfg = SEVERITY_CONFIG[key];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.style}`}>
      {cfg.label}
    </span>
  );
};

const STATUS_CONFIG = {
  WaitingAssignment: { label: 'Belum Ditugaskan', style: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  Assigned:          { label: 'Ditugaskan',        style: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  InProgress:        { label: 'Sedang Dikerjakan', style: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  WaitingApproval:   { label: 'Menunggu Approval', style: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  RevisionRequired:  { label: 'Perlu Revisi',      style: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 font-bold' },
  Done:              { label: 'Selesai',           style: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, style: 'bg-stone-100 text-stone-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.style}`}>
      {cfg.label}
    </span>
  );
};

const formatDate = (isoString) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const AssetTable = ({ title, data = [], type = 'critical' }) => {
  const navigate = useNavigate();
  const [severityFilter, setSeverityFilter] = useState('all');

  const displayData = useMemo(() => {
    if (type !== 'latest') return data;

    const active = data.filter((ticket) => ticket.status !== 'Done');

    const filtered = severityFilter === 'all'
      ? active
      : active.filter((ticket) => normalizeSeverity(ticket.priority) === severityFilter);

    return [...filtered].sort(
      (a, b) => SEVERITY_CONFIG[normalizeSeverity(a.priority)].order
              - SEVERITY_CONFIG[normalizeSeverity(b.priority)].order
    );
  }, [data, type, severityFilter]);

  if (displayData.length === 0) {
    return (
      <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 mb-3">{title}</h3>
        <p className="text-xs text-stone-600 dark:text-stone-300 italic py-4 text-center">
          Tidak ada data untuk ditampilkan.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
        <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
          {type === 'critical'    && <AlertTriangle size={16} className="text-red-500" />}
          {type === 'problematic' && <Wrench size={16} className="text-amber-500" />}
          {type === 'latest'      && <Clock size={16} className="text-blue-500" />}
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {type === 'latest' && (
            <div className="flex items-center gap-1.5 text-stone-400 dark:text-stone-500">
              <Filter size={13} />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="text-xs font-semibold bg-transparent border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1 text-stone-600 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="all">Semua Tingkat</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          )}
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
            {displayData.length} item
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        {type === 'latest' ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                <th className="px-5 py-3">Mesin</th>
                <th className="px-5 py-3">Tipe Kerusakan</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Engineer</th>
                <th className="px-5 py-3">Dibuat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {displayData.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-stone-50/80 dark:hover:bg-stone-800/50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-stone-800 dark:text-stone-200 group-hover:text-blue-600 transition-colors">
                    {ticket.machine_name}
                  </td>
                  <td className="px-5 py-3.5">
                    <SeverityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-5 py-3.5 text-xs text-stone-600 dark:text-stone-300">
                    {ticket.engineer_name || <span className="italic">Belum ditugaskan</span>}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-stone-600 dark:text-stone-300 whitespace-nowrap">
                    {formatDate(ticket.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                <th className="px-5 py-3">Mesin</th>
                <th className="px-5 py-3 text-right">
<<<<<<< HEAD
                  {type === 'critical' ? 'RUL' : 'Jumlah Kerusakan'}
=======
                  {type === 'critical' ? 'Sisa Umur (RUL)' : 'Jumlah Kerusakan'}
>>>>>>> 0c118e3 (Update keterangan sumbu X dan Y pada dashboard)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {data.map((item, i) => (
                <tr
                  key={`${item.id || 'item'}-${i}`}
                  className="hover:bg-stone-50/80 dark:hover:bg-stone-800/50 transition-colors"
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-stone-800 dark:text-stone-200">
                    {item.name}
                  </td>

                  {type === 'critical' ? (
                    <td className="px-5 py-3.5 text-right">
                      {item.rul_days != null ? (() => {
                        const days  = Number(item.rul_days);
                        const hours = Math.round(days * 24);
                        const label = days < 1 ? `${hours} jam` : `${Math.round(days)} hari`;

                        // Ambang status disamakan dengan pipeline model ML (Test.ipynb):
                        // < 7 hari -> CRITICAL/URGENT, 7-29 hari -> CRITICAL/HIGH,
                        // 30-59 hari -> WARNING, >=60 hari -> NORMAL
                        let badge = null;
                        let colorClass = 'text-stone-600 bg-stone-100 dark:bg-stone-800 dark:text-stone-300';
                        if (days < 7) {
                          badge = 'Mendesak!';
                          colorClass = 'text-red-600 bg-red-50 dark:bg-red-950/40';
                        } else if (days < 30) {
                          badge = 'Kritis!';
                          colorClass = 'text-red-600 bg-red-50 dark:bg-red-950/40';
                        } else if (days < 60) {
                          badge = 'Waspada';
                          colorClass = 'text-amber-600 bg-amber-50 dark:bg-amber-950/40';
                        }

                        return (
                          <span className={`font-bold text-sm px-2.5 py-1 rounded-lg ${colorClass}`}>
                            {label}
                            {badge && (
                              <span className="ml-1.5 text-[10px] bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded-full">
                                {badge}
                              </span>
                            )}
                          </span>
                        );
                      })() : (
                        <span className="text-stone-400 italic text-xs">Belum ada data</span>
                      )}
                    </td>
                  ) : (
                    <td className="px-5 py-3.5 text-right">
                      {item.total_failure != null ? (
                        <span className="font-bold text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg">
                          {Number(item.total_failure)}x rusak
                        </span>
                      ) : (
                        <span className="text-stone-400 italic text-xs">Belum ada data</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AssetTable;