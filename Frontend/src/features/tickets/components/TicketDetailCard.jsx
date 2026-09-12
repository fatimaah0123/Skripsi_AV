import React from 'react';
import {
  Calendar, Activity, UserCheck, Play,
  CheckCircle, Send, ShieldCheck, Loader2,
  AlertOctagon, XCircle, FileText, Trash2, Users, UserCog
} from 'lucide-react';
import TicketStatusBadge from './TicketStatusBadge';
import { useAuth } from '../../../context/AuthContext';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
};

// Ubah desimal jam (mis. 1.5) menjadi teks "1 jam 30 menit" agar lebih enak dibaca
const formatDurationHours = (decimalHours) => {
  const total = Number(decimalHours) || 0;
  const hours = Math.floor(total);
  const minutes = Math.round((total - hours) * 60);

  if (hours === 0 && minutes === 0) return '0 menit';
  if (hours === 0) return `${minutes} menit`;
  if (minutes === 0) return `${hours} jam`;
  return `${hours} jam ${minutes} menit`;
};

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
};

const InfoRow = ({ label, value, className = '' }) => (
  <div className="p-4 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 border-l-[3px] border-l-blue-400 dark:border-l-blue-500 rounded-xl">
    <p className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider mb-1.5">{label}</p>
    <p className={`text-sm font-semibold text-stone-800 dark:text-stone-200 ${className}`}>{value || '—'}</p>
  </div>
);

const PriorityBadge = ({ priority }) => {
  const config = {
    High:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Low:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${config[priority] || config.Medium}`}>
      {priority || 'Medium'}
    </span>
  );
};

const TicketDetailCard = ({
  ticket,
  report,
  actionLoading,
  onAssignClick,
  onStartClick,
  onSubmitClick,
  onApprove,
  onRejectClick,
  onReassignClick,
  onDeleteClick,
}) => {
  const { isAdmin, user } = useAuth();
  const status    = ticket.status;

  // ticket.engineers: array of { id, name, role: 'Leader' | 'Member' } — dari TicketDetailData
  const engineers = ticket.engineers || [];
  const leader    = engineers.find((e) => e.role === 'Leader');
  const members   = engineers.filter((e) => e.role === 'Member');

  // Hanya Leader yang boleh start/submit tiketnya sendiri
  const isMyTicket = !isAdmin && leader && String(leader.id) === String(user?.id);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <TicketStatusBadge status={status} />
              {/* Priority badge (HIGH/MEDIUM/LOW) hanya muncul jika tiket BELUM Selesai (Done) */}
              {status !== 'Done' && <PriorityBadge priority={ticket.priority} />}
              <span className="text-xs text-stone-400 font-mono">#{ticket.id}</span>
            </div>
            <h1 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">
              {ticket.machine_name}
            </h1>
            <p className="text-sm text-stone-500 mt-1">{ticket.type}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <Calendar size={13} />
            {formatDate(ticket.created_at)}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Catatan admin sebelum assign, ATAU alasan reject (backend pakai 1 field `notes` untuk keduanya) */}
        {ticket.notes && status !== 'Rejected' && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">
              <FileText size={15} /> Catatan Tambahan Admin
            </div>
            <p className="text-sm text-stone-700 dark:text-stone-300 font-medium pl-6">
              "{ticket.notes}"
            </p>
          </div>
        )}

        {ticket.notes && status === 'Rejected' && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 space-y-1">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
              <AlertOctagon size={16} /> Laporan Ditolak / Perlu Revisi
            </div>
            <p className="text-sm text-stone-700 dark:text-stone-300 font-medium pl-6">
              "{ticket.notes}"
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <InfoRow label="RUL (Jam)"  value={ticket.rul_hours != null ? `${ticket.rul_hours} jam` : '—'} />
          <InfoRow label="RUL (Hari)" value={ticket.rul_days  != null ? `${ticket.rul_days} hari` : '—'} />

          {/* Tampilkan status NORMAL jika tiket sudah Done / Selesai */}
          <InfoRow
            label="Kondisi"
            value={status === 'Done' ? 'NORMAL' : ticket.maintenance_status}
            className={status === 'Done' ? 'text-green-600 dark:text-green-400 font-bold' : ''}
          />

          <InfoRow label="Confidence" value={ticket.confidence != null ? `${(ticket.confidence * 100).toFixed(1)}%` : '—'} />
          <InfoRow
            label="Leader"
            value={leader?.name || 'Belum ditugaskan'}
            className={!leader ? 'text-stone-400 italic' : ''}
          />
          <InfoRow label="Dibuat" value={formatDate(ticket.created_at)} />
        </div>

        {ticket.action && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={14} className="text-blue-500" />
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Rekomendasi AI</span>
            </div>
            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{ticket.action}</p>
          </div>
        )}

        {/* Tim yang ditugaskan (Leader + Member) — muncul begitu tiket sudah di-assign */}
        {engineers.length > 0 && (
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-widest">
              <Users size={14} /> Tim Ditugaskan
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
              <UserCheck size={16} className="text-blue-500 shrink-0" />
              <span><span className="font-semibold">Leader:</span> {leader?.name || '—'}</span>
            </div>
            {members.length > 0 && (
              <div className="text-sm text-stone-700 dark:text-stone-300">
                <span className="font-semibold">Member:</span>
                <ul className="list-disc list-inside pl-6 mt-1 space-y-0.5 text-stone-600 dark:text-stone-400">
                  {members.map((m) => (
                    <li key={m.id}>{m.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* LAPORAN ENGINEER — GANTI: field laporan (description, action_taken, notes, image_urls,
            duration_hours) sekarang ada di endpoint terpisah GET /{id}/report, bukan menempel
            di objek ticket lagi. Prop `report` dikirim dari TicketDetailPage. */}
        {(status === 'WaitingApproval' || status === 'Done' || status === 'Rejected') && report && (
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-3">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Laporan Engineer</p>

            <div className="space-y-2 text-sm text-stone-700 dark:text-stone-300 pt-1">
              <p><span className="font-semibold">Deskripsi:</span> {report.description}</p>
              <p><span className="font-semibold">Tindakan:</span> {report.action_taken}</p>
              {/* report.notes = catatan tambahan dari engineer, beda dari ticket.notes (punya admin) */}
              {report.notes && <p><span className="font-semibold">Catatan Engineer:</span> {report.notes}</p>}
              {report.duration_hours != null && (
                <p><span className="font-semibold">Durasi:</span> {formatDurationHours(report.duration_hours)}</p>
              )}
            </div>

            {/* GANTI: image_url (string) -> image_urls (array). Bisa lebih dari satu foto
                kalau laporan pernah ditolak lalu di-submit ulang. */}
            {report.image_urls?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-stone-400 mb-1">
                  Bukti Pekerjaan {report.image_urls.length > 1 ? `(${report.image_urls.length} foto)` : ''}:
                </p>
                <div className={`grid gap-2 ${report.image_urls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {report.image_urls.map((url, idx) => (
                    <img
                      key={url + idx}
                      src={getImageUrl(url)}
                      alt={`Bukti pekerjaan ${idx + 1}`}
                      className="w-full rounded-xl object-cover max-h-64 border border-stone-200 dark:border-stone-700 shadow-sm"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* State: laporan belum berhasil dimuat/belum ada padahal statusnya harusnya sudah punya laporan */}
        {(status === 'WaitingApproval' || status === 'Done' || status === 'Rejected') && !report && (
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-dashed border-stone-200 dark:border-stone-700 text-center">
            <p className="text-xs text-stone-400">Laporan belum tersedia atau masih dimuat.</p>
          </div>
        )}
      </div>

      <div className="px-6 pb-6 space-y-3">
        {isAdmin && status === 'WaitingAssignment' && (
          <button
            onClick={onAssignClick}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-60 cursor-pointer"
          >
            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
            Tugaskan Engineer
          </button>
        )}

        {/* GANTI (alur baru hasil diskusi): reassign sekarang HANYA boleh selama status
            `Assigned` — sebelum teknisi klik "Mulai Pengerjaan". Begitu status jadi
            `InProgress`, admin tidak bisa lagi mengubah tim maupun menghapus tiket.
            CATATAN BACKEND: endpoint PATCH /{id}/assignments saat ini masih mensyaratkan
            status InProgress ("Status tiket harus InProgress") — precondition-nya perlu
            diubah oleh backend jadi menerima status `Assigned` supaya tombol ini berfungsi. */}
        {isAdmin && status === 'Assigned' && onReassignClick && (
          <button
            onClick={onReassignClick}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 rounded-xl font-bold text-xs transition-all border border-cyan-200 dark:border-cyan-800/40 cursor-pointer"
          >
            <UserCog size={14} /> Tarik Kembali / Ganti Teknisi
          </button>
        )}

        {!isAdmin && isMyTicket && status === 'Assigned' && (
          <button
            onClick={onStartClick}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-60 cursor-pointer"
          >
            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Mulai Pengerjaan
          </button>
        )}

        {!isAdmin && isMyTicket && (status === 'InProgress' || status === 'Rejected') && (
          <button
            onClick={onSubmitClick}
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-all cursor-pointer"
          >
            <Send size={16} />
            {status === 'Rejected' ? 'Kirim Ulang Laporan Revisi' : 'Submit Laporan Perbaikan'}
          </button>
        )}

        {isAdmin && status === 'WaitingApproval' && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onRejectClick}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl font-bold text-sm transition-all border border-rose-200 dark:border-rose-800/40 disabled:opacity-60 cursor-pointer"
            >
              <XCircle size={16} /> Tolak / Minta Revisi
            </button>
            <button
              type="button"
              onClick={onApprove}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-60 cursor-pointer"
            >
              {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Setujui
            </button>
          </div>
        )}

        {status === 'Done' && (
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold text-sm border border-green-100 dark:border-green-800/40">
            <ShieldCheck size={16} />
            Tiket Selesai & Disetujui
          </div>
        )}

        {isAdmin && onDeleteClick && (status === 'WaitingAssignment' || status === 'Assigned') && (
          <button
            type="button"
            onClick={onDeleteClick}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl font-bold text-xs transition-all border border-rose-200 dark:border-rose-800/40 mt-2 cursor-pointer"
          >
            <Trash2 size={14} /> Hapus Tiket Pemeliharaan
          </button>
        )}
      </div>
    </div>
  );
};

export default TicketDetailCard;