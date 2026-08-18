import React, { useState, useEffect } from 'react';
import { X, UserCheck, Loader2, FileText, Users } from 'lucide-react';
import { ticketService } from '../services/ticketService';

const AssignModal = ({ ticket, onConfirm, onClose, isSubmitting }) => {
  const [engineers, setEngineers]       = useState([]);
  const [leaderId, setLeaderId]         = useState('');
  const [memberIds, setMemberIds]       = useState([]);
  const [notes, setNotes]               = useState('');
  const [loadingEngineers, setLoadingEngineers] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await ticketService.getEngineers();
        setEngineers(data);
        // Prefill jika tiket sudah pernah di-assign sebelumnya (ticket.engineers dari TicketDetailData)
        if (ticket?.engineers?.length) {
          const leader = ticket.engineers.find((e) => e.role === 'Leader');
          const members = ticket.engineers.filter((e) => e.role === 'Member');
          if (leader) setLeaderId(String(leader.id));
          setMemberIds(members.map((m) => String(m.id)));
        }
        if (ticket?.notes) {
          setNotes(ticket.notes);
        }
      } catch {
        setEngineers([]);
      } finally {
        setLoadingEngineers(false);
      }
    };
    load();
  }, [ticket]);

  if (!ticket) return null;

  const toggleMember = (id) => {
    const idStr = String(id);
    // Engineer yang sudah jadi Leader tidak boleh dipilih jadi Member juga
    if (idStr === leaderId) return;
    setMemberIds((prev) =>
      prev.includes(idStr) ? prev.filter((m) => m !== idStr) : [...prev, idStr]
    );
  };

  const handleLeaderChange = (id) => {
    setLeaderId(id);
    // Kalau engineer yang baru dipilih jadi leader sebelumnya ada di member, hapus dari member
    setMemberIds((prev) => prev.filter((m) => m !== id));
  };

  const canSubmit = Boolean(leaderId) && !isSubmitting;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-md">
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <UserCheck size={16} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                Tugaskan Leader & Member
              </h3>
              <p className="text-xs text-stone-400 mt-0.5 truncate max-w-[200px]">{ticket.machine_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Pilih Leader (wajib) */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
              Leader <span className="text-rose-500">*</span>
            </label>
            {loadingEngineers ? (
              <div className="flex items-center gap-2 text-stone-400 text-sm py-2">
                <Loader2 size={14} className="animate-spin" /> Memuat daftar engineer...
              </div>
            ) : (
              <select
                value={leaderId}
                onChange={(e) => handleLeaderChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
              >
                <option value="">-- Pilih Leader --</option>
                {engineers.map((eng) => (
                  <option key={eng.id} value={eng.id}>
                    {eng.name} ({eng.employee_id})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Pilih Member (opsional, multi) */}
          {!loadingEngineers && engineers.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Users size={13} /> Member (Opsional)
              </label>
              <div className="max-h-40 overflow-y-auto space-y-1.5 border border-stone-200 dark:border-stone-700 rounded-xl p-2">
                {engineers
                  .filter((eng) => String(eng.id) !== leaderId)
                  .map((eng) => (
                    <label
                      key={eng.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={memberIds.includes(String(eng.id))}
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
          )}

          {/* Catatan admin */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <FileText size={13} /> Catatan / Instruksi Khusus (Opsional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Fokus cek area pelumas gear utama, utamakan keselamatan kerja..."
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white text-xs font-normal focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="p-5 border-t border-stone-100 dark:border-stone-800 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all text-xs"
          >
            Batal
          </button>

          <button
            onClick={() => onConfirm(ticket.id, leaderId, memberIds, notes)}
            disabled={!canSubmit}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {isSubmitting ? (
              <><Loader2 size={14} className="animate-spin" /> Menyimpan...</>
            ) : (
              <><UserCheck size={14} /> Simpan</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignModal;