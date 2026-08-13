import React from 'react';
import { X, Box, MapPin, Calendar, Activity, Cpu } from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
};

const MachineDetailModal = ({ machine, onClose }) => {
  if (!machine) return null;

  const isActive = machine.status === 'Active';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 w-full max-w-md relative space-y-5">
        
        {/* Header Modal */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
              <Box size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-500 font-mono">{machine.code}</span>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white leading-tight">
                {machine.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            {machine.status}
          </div>
          <span className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-md text-xs font-bold">
            Tipe: {machine.type || '—'}
          </span>
        </div>

        {/* Grid Informasi Mesin */}
        <div className="grid grid-cols-1 gap-3 pt-2">
          <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800 flex items-center gap-3">
            <MapPin size={18} className="text-stone-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Lokasi Mesin</p>
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                {machine.location || 'Tidak ditentukan'}
              </p>
            </div>
          </div>

          <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800 flex items-center gap-3">
            <Calendar size={18} className="text-stone-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tanggal Instalasi</p>
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                {formatDate(machine.install_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="pt-3">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-bold text-sm transition-all"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

export default MachineDetailModal;