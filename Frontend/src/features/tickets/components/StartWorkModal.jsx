import React, { useState, useEffect } from 'react';
import { X, Play, Loader2, Users, UserCheck } from 'lucide-react';
import { ticketService } from '../services/ticketService';

const StartWorkModal = ({ ticket, onConfirm, onClose, isSubmitting }) => {
  const currentEngineers = ticket?.engineers || [];
  const leader           = currentEngineers.find((e) => e.role === 'Leader');
  const currentMembers   = currentEngineers.filter((e) => e.role === 'Member');
  const currentIds       = currentEngineers.map((e) => String(e.id));

  const [allEngineers, setAllEngineers]         = useState([]);
  const [loadingEngineers, setLoadingEngineers] = useState(true);
  const [newMemberIds, setNewMemberIds]         = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await ticketService.getEngineers();
        setAllEngineers(data);
      } catch {
        setAllEngineers([]);
      } finally {
        setLoadingEngineers(false);
      }
    };
    load();
  }, []);

  if (!ticket) return null;

  const toggleMember = (id) => {
    const idStr = String(id);
    setNewMemberIds((prev) =>
      prev.includes(idStr) ? prev.filter((m) => m !== idStr) : [...prev, idStr]
    );
  };

  const availableToAdd = allEngineers.filter((eng) => !currentIds.includes(String(eng.id)));

  const handleSubmit = () => {
    onConfirm(ticket.id, newMemberIds);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-md">
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Play size={16} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                Mulai Pengerjaan
              </h3>
              <p className="text-xs text-stone-400 mt-0.5 truncate max-w-[200px]">{ticket.machine_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Ringkasan tim saat ini */}
          <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
              <UserCheck size={14} className="text-blue-500 shrink-0" />
              <span><span className="font-semibold">Leader:</span> {leader?.name || '—'}</span>
            </div>
            {currentMembers.length > 0 && (
              <div className="text-sm text-stone-700 dark:text-stone-300 pl-6">
                <span className="font-semibold">Member:</span>{' '}
                {currentMembers.map((m) => m.name).join(', ')}
              </div>
            )}
          </div>

          {/* Tambah member baru — opsional */}
          {loadingEngineers ? (
            <div className="flex items-center gap-2 text-stone-400 text-sm py-2">
              <Loader2 size={14} className="animate-spin" /> Memuat daftar engineer...
            </div>
          ) : availableToAdd.length > 0 ? (
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Users size={13} /> Tambah Member Baru (Opsional)
              </label>
              <p className="text-xs text-stone-400 mb-2">
                Kalau butuh bantuan tambahan sebelum mulai, pilih engineer di bawah ini.
              </p>
              <div className="max-h-40 overflow-y-auto space-y-1.5 border border-stone-200 dark:border-stone-700 rounded-xl p-2">
                {availableToAdd.map((eng) => (
                  <label
                    key={eng.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={newMemberIds.includes(String(eng.id))}
                      onChange={() => toggleMember(eng.id)}
                      className="rounded border-stone-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-stone-700 dark:text-stone-300">
                      {eng.name} ({eng.employee_id})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-stone-400 italic">Semua engineer sudah tergabung di tim ini.</p>
          )}
        </div>

        <div className="p-5 border-t border-stone-100 dark:border-stone-800 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all text-xs"
          >
            Batal
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {isSubmitting ? (
              <><Loader2 size={14} className="animate-spin" /> Memulai...</>
            ) : (
              <><Play size={14} /> {newMemberIds.length > 0 ? 'Mulai + Tambah Member' : 'Mulai Pengerjaan'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartWorkModal;