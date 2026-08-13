import React from 'react';
import { Pencil, Trash2, AlertTriangle, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const StatusBadge = ({ status }) => {
  const isActive = status === 'Active';
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
        isActive
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      }`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
        }`}
      />
      {status}
    </div>
  );
};

const CriticalityBadge = ({ type }) => {
  const normalizedType = String(type || '').toUpperCase();

  const config = {
    H: {
      label: 'Critical',
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200',
    },
    HIGH: {
      label: 'Critical',
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200',
    },
    CRITICAL: {
      label: 'Critical',
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200',
    },
    M: {
      label: 'Warning',
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200',
    },
    MEDIUM: {
      label: 'Warning',
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200',
    },
    WARNING: {
      label: 'Warning',
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200',
    },
    L: {
      label: 'Normal',
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200',
    },
    LOW: {
      label: 'Normal',
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200',
    },
    NORMAL: {
      label: 'Normal',
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200',
    },
  };

  const current = config[normalizedType] || {
    label: type || '—',
    color: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200',
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap border ${current.color}`}>
      {current.label}
    </span>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const DeleteConfirmDialog = ({ machine, onConfirm, onCancel }) => {
  if (!machine) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 shrink-0 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h4 className="font-bold text-stone-900 dark:text-white">Hapus Mesin?</h4>
            <p className="text-xs text-stone-500 mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 break-words">
          Anda akan menghapus mesin{' '}
          <span className="font-bold text-stone-900 dark:text-white">"{machine.name}"</span>.
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all text-sm"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(machine.id)}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all text-sm"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

const MachineCard = ({ machine, isAdmin, onEdit, onDeleteClick, onSelectMachine }) => (
  <div
    onClick={() => onSelectMachine(machine)}
    className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 p-4 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-all"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-xs font-bold text-blue-500 mb-0.5">{machine.code}</div>
        <div className="text-sm font-semibold text-stone-800 dark:text-stone-200 truncate">
          {machine.name}
        </div>
      </div>
      <StatusBadge status={machine.status} />
    </div>

    <div className="mt-3 flex flex-wrap gap-2">
      <CriticalityBadge type={machine.type} />
    </div>

    <div className="mt-3 space-y-1.5 text-xs text-stone-500 dark:text-stone-400">
      <div className="flex items-center gap-1.5">
        <MapPin size={13} className="shrink-0" />
        <span className="truncate">{machine.location || '—'}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Calendar size={13} className="shrink-0" />
        <span>{formatDate(machine.install_date)}</span>
      </div>
    </div>

    {isAdmin && (
      <div
        className="mt-4 flex items-center gap-2 pt-3 border-t border-stone-100 dark:border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onEdit(machine)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all text-xs font-bold"
        >
          <Pencil size={14} />
          Edit
        </button>
        <button
          onClick={() => onDeleteClick(machine)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all text-xs font-bold"
        >
          <Trash2 size={14} />
          Hapus
        </button>
      </div>
    )}
  </div>
);

const MachineTable = ({ machines = [], onEdit, onDeleteClick, onSelectMachine }) => {
  const { isAdmin } = useAuth();

  if (machines.length === 0) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 p-10 sm:p-16 text-center">
        <p className="text-stone-400 text-sm">Tidak ada data mesin ditemukan.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        {machines.map((machine) => (
          <MachineCard
            key={machine.id}
            machine={machine}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDeleteClick={onDeleteClick}
            onSelectMachine={onSelectMachine}
          />
        ))}
      </div>

      <div className="hidden sm:block bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
                {['No', 'Kode / Nama', 'Tipe / Kekritisan', 'Lokasi', 'Instalasi', 'Status'].map((h, i) => (
                  <th
                    key={i}
                    className={`px-4 lg:px-6 py-4 text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest ${
                      h === 'No' ? 'text-center w-14' : ''
                    }`}
                  >
                    {h}
                  </th>
                ))}
                {isAdmin && (
                  <th className="px-4 lg:px-6 py-4 text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-right">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {machines.map((machine, index) => (
                <tr
                  key={machine.id}
                  onClick={() => onSelectMachine(machine)}
                  className="hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-colors cursor-pointer group"
                >
                  <td className="px-4 lg:px-6 py-4 text-center text-sm text-stone-500 dark:text-stone-400">
                    {index + 1}
                  </td>
                  <td className="px-4 lg:px-6 py-4 max-w-[220px]">
                    <div className="text-xs font-bold text-blue-500 mb-0.5">{machine.code}</div>
                    <div className="text-sm font-semibold text-stone-800 dark:text-stone-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {machine.name}
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <CriticalityBadge type={machine.type} />
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-sm text-stone-600 dark:text-stone-400 max-w-[180px] truncate">
                    {machine.location || '—'}
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-sm text-stone-500 dark:text-stone-400 whitespace-nowrap">
                    {formatDate(machine.install_date)}
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <StatusBadge status={machine.status} />
                  </td>
                  {isAdmin && (
                    <td className="px-4 lg:px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(machine)}
                          className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          title="Edit mesin"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => onDeleteClick(machine)}
                          className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          title="Hapus mesin"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default MachineTable;