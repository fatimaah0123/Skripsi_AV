import React, { useState } from 'react';
import { X, AlertTriangle, Loader2, Send } from 'lucide-react';

const RejectModal = ({ ticket, onConfirm, onClose, isSubmitting }) => {
  const [notes, setNotes] = useState('');

  if (!ticket) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!notes.trim()) return;
    onConfirm(ticket.id, notes);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-md">
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <AlertTriangle size={16} className="text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">Tolak Laporan & Minta Revisi</h3>
              <p className="text-xs text-stone-400 mt-0.5 truncate max-w-[200px]">{ticket.machine_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-3">
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest">
              Alasan Penolakan <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tuliskan secara detail bagian laporan/pekerjaan mana yang kurang atau salah..."
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-white text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 outline-none transition-all placeholder:text-stone-400"
            />
          </div>

          <div className="p-5 border-t border-stone-100 dark:border-stone-800 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!notes.trim() || isSubmitting}
              className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><Loader2 size={14} className="animate-spin" /> Mengirim...</>
              ) : (
                <><Send size={14} /> Kirim Penolakan</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectModal;