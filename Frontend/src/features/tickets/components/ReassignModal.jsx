import React, { useState, useEffect } from 'react';
import { X, UserCog, Loader2, UserCheck, UserPlus, UserMinus } from 'lucide-react';
import { ticketService } from '../services/ticketService';

const ReassignModal = ({ ticket, onConfirm, onClose, isSubmitting }) => {
  const currentEngineers = ticket?.engineers || [];
  const currentLeader    = currentEngineers.find((e) => e.role === 'Leader');
  const currentMembers   = currentEngineers.filter((e) => e.role === 'Member');
  const currentIds       = currentEngineers.map((e) => String(e.id));

  const [allEngineers, setAllEngineers]     = useState([]);
  const [loadingEngineers, setLoadingEngineers] = useState(true);

  // Kosong berarti "tidak diubah" — hanya dikirim ke backend kalau user benar-benar pilih leader baru
  const [newLeaderId, setNewLeaderId]   = useState('');
  const [removeMemberIds, setRemoveIds] = useState([]);
  const [addMemberIds, setAddIds]       = useState([]);

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

  const toggleRemove = (id) => {
    const idStr = String(id);
    setRemoveIds((prev) =>
      prev.includes(idStr) ? prev.filter((m) => m !== idStr) : [...prev, idStr]
    );
  };

  const toggleAdd = (id) => {
    const idStr = String(id);
    setAddIds((prev) =>
      prev.includes(idStr) ? prev.filter((m) => m !== idStr) : [...prev, idStr]
    );
  };

  // Engineer yang belum ada di tim sama sekali, jadi bisa dipilih untuk ditambahkan
  const availableToAdd = allEngineers.filter((eng) => !currentIds.includes(String(eng.id)));

  const hasChange = Boolean(newLeaderId) || removeMemberIds.length > 0 || addMemberIds.length > 0;
  const canSubmit = hasChange && !isSubmitting;

  const handleSubmit = () => {
    onConfirm(ticket.id, {
      leaderId: newLeaderId || undefined,
      addMemberIds,
      removeMemberIds,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-md">
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <UserCog size={16} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                Tarik Kembali / Ganti Teknisi
              </h3>
              <p className="text-xs text-stone-400 mt-0.5 truncate max-w-[200px]">{ticket.machine_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[65vh] overflow-y-auto">
          <p className="text-xs text-stone-400 bg-stone-50 dark:bg-stone-800/50 rounded-lg p-3">
            Tiket ini belum mulai dikerjakan (status Ditugaskan). Kamu masih bisa menarik
            kembali atau mengganti Leader/Member sebelum teknisi menekan tombol "Mulai
            Pengerjaan". Setelah tiket berstatus Sedang Dikerjakan, tim tidak bisa diubah lagi.
          </p>

          {loadingEngineers ? (
            <div className="flex items-center gap-2 text-stone-400 text-sm py-2">
              <Loader2 size={14} className="animate-spin" /> Memuat daftar engineer...
            </div>
          ) : (
            <>
              {/* Ganti Leader */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                  Leader Saat Ini: <span className="text-blue-600">{currentLeader?.name || '—'}</span>
                </label>
                <select
                  value={newLeaderId}
                  onChange={(e) => setNewLeaderId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
                >
                  <option value="">-- Tidak diubah --</option>
                  {allEngineers
                    .filter((eng) => String(eng.id) !== String(currentLeader?.id))
                    .map((eng) => (
                      <option key={eng.id} value={eng.id}>
                        {eng.name} ({eng.employee_id})
                      </option>
                    ))}
                </select>
              </div>

              {/* Hapus Member yang ada */}
              {currentMembers.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <UserMinus size={13} /> Hapus dari Tim
                  </label>
                  <div className="space-y-1.5 border border-stone-200 dark:border-stone-700 rounded-xl p-2">
                    {currentMembers.map((m) => (
                      <label
                        key={m.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={removeMemberIds.includes(String(m.id))}
                          onChange={() => toggleRemove(m.id)}
                          className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                        />
                        <span className="text-stone-700 dark:text-stone-300">{m.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Tambah Member baru */}
              {availableToAdd.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <UserPlus size={13} /> Tambah Member Baru
                  </label>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 border border-stone-200 dark:border-stone-700 rounded-xl p-2">
                    {availableToAdd.map((eng) => (
                      <label
                        key={eng.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={addMemberIds.includes(String(eng.id))}
                          onChange={() => toggleAdd(eng.id)}
                          className="rounded border-stone-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-stone-700 dark:text-stone-300">
                          {eng.name} ({eng.employee_id})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
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
            disabled={!canSubmit}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {isSubmitting ? (
              <><Loader2 size={14} className="animate-spin" /> Menyimpan...</>
            ) : (
              <><UserCheck size={14} /> Simpan Perubahan</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReassignModal;