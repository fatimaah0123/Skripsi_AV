import React, { useState, useEffect, useCallback } from 'react';
import {
  History, CheckCircle2, Eye, Search,
  Calendar, RefreshCw, Clock, Wrench, Image, UserCheck, Users,
} from 'lucide-react';
import { ticketService } from '../services/ticketService';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
};

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
};

const DetailModal = ({ ticket, onClose }) => {
  const [report, setReport]         = useState(null);
  const [isLoadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    if (!ticket) return;
    let cancelled = false;

    const loadReport = async () => {
      setLoadingReport(true);
      setReportError('');
      try {
        const data = await ticketService.getTicketReport(ticket.id);
        if (!cancelled) setReport(data);
      } catch (err) {
        if (!cancelled) setReportError(err.response?.data?.message || 'Gagal memuat laporan.');
      } finally {
        if (!cancelled) setLoadingReport(false);
      }
    };

    loadReport();
    return () => { cancelled = true; };
  }, [ticket]);

  if (!ticket) return null;

  const leader  = report?.engineers?.find((e) => e.role === 'Leader');
  // Sebelumnya hanya Leader yang diambil dari report.engineers, padahal
  // shape-nya sama dengan ticket.engineers di TicketDetailCard.jsx (array
  // beratribut role: 'Leader' | 'Member') — jadi Member seharusnya juga ada.
  const members = report?.engineers?.filter((e) => e.role === 'Member') || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">Dokumen Hasil Pemeliharaan</h3>
              <p className="text-xs text-stone-400 font-mono mt-0.5">#{ticket.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-stone-500 hover:text-stone-800 dark:hover:text-white bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors">
            Tutup
          </button>
        </div>

        {isLoadingReport && (
          <div className="flex-1 flex items-center justify-center gap-2 text-stone-400 py-16">
            <RefreshCw size={16} className="animate-spin" />
            <span className="text-sm">Memuat laporan...</span>
          </div>
        )}

        {!isLoadingReport && reportError && (
          <div className="flex-1 flex items-center justify-center p-5">
            <p className="text-sm text-rose-500">{reportError}</p>
          </div>
        )}

        {!isLoadingReport && !reportError && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 border-l-[3px] border-l-blue-400 dark:border-l-blue-500 rounded-xl">
                <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-widest font-bold mb-1">Mesin</p>
                <p className="text-sm font-bold text-stone-800 dark:text-stone-200">{ticket.machine_name}</p>
                <p className="text-xs text-stone-400 mt-0.5">{ticket.type}</p>
              </div>
              {/* GANTI: leader diambil dari report.engineers (role Leader), bukan ticket.leader_name */}
              <div className="p-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 border-l-[3px] border-l-cyan-400 dark:border-l-cyan-500 rounded-xl">
                <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                  <UserCheck size={12} className="text-cyan-500" /> Leader
                </p>
                <p className="text-sm font-bold text-stone-800 dark:text-stone-200">{leader?.name || '—'}</p>
                <p className="text-xs text-stone-400 mt-0.5">{formatDate(ticket.created_at)}</p>
              </div>
            </div>

            {members.length > 0 && (
              <div className="p-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 border-l-[3px] border-l-cyan-400 dark:border-l-cyan-500 rounded-xl">
                <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1">
                  <Users size={12} className="text-cyan-500" /> Member ({members.length})
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {members.map((m) => (
                    <li
                      key={m.id}
                      className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800/40 text-xs font-semibold text-cyan-700 dark:text-cyan-300"
                    >
                      {m.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!report ? (
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-dashed border-stone-200 dark:border-stone-700 text-center">
                <p className="text-xs text-stone-400">Laporan tidak ditemukan untuk tiket ini.</p>
              </div>
            ) : (
              <>
                {report.description && (
                  <div>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                      <Wrench size={11} className="text-amber-500" /> Deskripsi Masalah
                    </p>
                    <p className="text-sm text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 border-l-[3px] border-l-amber-400 dark:border-l-amber-500 rounded-xl p-3 leading-relaxed">
                      {report.description}
                    </p>
                  </div>
                )}

                {report.action_taken && (
                  <div>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                      <CheckCircle2 size={11} className="text-green-500" /> Tindakan yang Dilakukan
                    </p>
                    <p className="text-sm text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 border-l-[3px] border-l-green-400 dark:border-l-green-500 rounded-xl p-3 leading-relaxed">
                      {report.action_taken}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {report.duration_hours != null && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 border-l-[3px] border-l-blue-400 dark:border-l-blue-500 rounded-xl">
                      <p className="text-[10px] text-blue-500 dark:text-blue-400 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                        <Clock size={10} /> Durasi
                      </p>
                      <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{report.duration_hours} jam</p>
                    </div>
                  )}
                  {report.notes && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 border-l-[3px] border-l-slate-400 dark:border-l-slate-500 rounded-xl col-span-2">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">Catatan Engineer</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic">{report.notes}</p>
                    </div>
                  )}
                </div>

                {report.image_urls?.length > 0 ? (
                  <div>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                      <Image size={11} className="text-blue-500" /> Foto Bukti Pekerjaan {report.image_urls.length > 1 ? `(${report.image_urls.length} foto)` : ''}
                    </p>
                    <div className={`grid gap-2 ${report.image_urls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {report.image_urls.map((url, idx) => (
                        <img
                          key={url + idx}
                          src={getImageUrl(url)}
                          alt={`Bukti pekerjaan ${idx + 1}`}
                          className="w-full rounded-xl object-cover max-h-56 border border-stone-200 dark:border-stone-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-dashed border-stone-200 dark:border-stone-700 text-center">
                    <p className="text-xs text-stone-400">Tidak ada foto bukti tersimpan.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const MaintenanceHistory = () => {
  const [tickets, setTickets]               = useState([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [error, setError]                   = useState('');
  const [searchTerm, setSearchTerm]         = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [currentPage, setCurrentPage]       = useState(1);
  const PAGE_SIZE = 20;

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const all = await ticketService.getAllTickets();
      const done = all.filter((t) => t.status === 'Done');
      // Urutkan berdasarkan tanggal perbaikan, terbaru di atas.
      // CATATAN: field tanggal yang tersedia di list endpoint saat ini hanya
      // `created_at` (tanggal tiket dibuat) — belum ada field terpisah untuk
      // tanggal tiket selesai/disetujui (mis. `completed_at`/`approved_at`).
      // Kalau backend menambahkan field itu nanti, ganti key sort di bawah ini.
      done.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setTickets(done);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat riwayat pemeliharaan.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const filtered = tickets.filter((t) =>
    t.machine_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset ke halaman 1 setiap kali kata kunci pencarian berubah,
  // supaya tidak "nyangkut" di halaman kosong.
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const totalPages   = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage     = Math.min(currentPage, totalPages);
  const startIndex   = (safePage - 1) * PAGE_SIZE;
  const paginated    = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const goToPage = (page) => setCurrentPage(Math.min(Math.max(1, page), totalPages));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl text-white shadow-lg shadow-green-500/20">
            <History size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">Riwayat Pemeliharaan</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">Arsip seluruh tiket yang telah selesai dan disetujui</p>
          </div>
        </div>
        {!isLoading && !error && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/40 rounded-xl">
            <CheckCircle2 size={14} className="text-green-500" />
            <span className="text-xs font-bold text-green-600 dark:text-green-400">{tickets.length} Tiket Selesai</span>
          </div>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
        <input
          type="text"
          placeholder="Cari mesin atau tipe kerusakan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none transition-all shadow-sm"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-48 gap-3 text-stone-400">
          <RefreshCw size={18} className="animate-spin" />
          <span className="text-sm">Memuat riwayat pemeliharaan...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
                  {['No.', 'Mesin', 'Jenis Kerusakan', 'Tanggal', 'Status', 'Dokumen'].map((h, i) => (
                    <th key={i} className="px-6 py-4 text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-stone-400 text-sm">
                      {searchTerm ? 'Tidak ada hasil yang cocok.' : 'Belum ada riwayat pemeliharaan.'}
                    </td>
                  </tr>
                ) : paginated.map((ticket, index) => (
                  <tr key={ticket.id} className="hover:bg-green-50/30 dark:hover:bg-green-900/10 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-stone-500 dark:text-stone-400">{startIndex + index + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-stone-800 dark:text-stone-200">{ticket.machine_name}</p>
                      <p className="text-xs text-stone-400 font-mono mt-0.5">#{ticket.id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600 dark:text-stone-400 max-w-[160px]">
                      <span className="line-clamp-2">{ticket.type || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 whitespace-nowrap">
                        <Calendar size={13} />
                        {formatDate(ticket.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/40 whitespace-nowrap">
                        <CheckCircle2 size={11} /> Approved
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-blue-600 hover:text-white text-stone-600 dark:text-stone-300 rounded-lg font-semibold text-xs transition-all whitespace-nowrap"
                      >
                        <Eye size={13} /> Lihat Dokumen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="px-6 py-4 bg-stone-50 dark:bg-stone-800/30 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-stone-400">
                Menampilkan <span className="font-bold text-stone-600 dark:text-stone-300">{startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, filtered.length)}</span> dari{' '}
                <span className="font-bold text-stone-600 dark:text-stone-300">{filtered.length}</span> riwayat
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage === 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Sebelumnya
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      // Batasi jumlah nomor halaman yang tampil supaya tidak penuh kalau datanya banyak:
                      // selalu tampilkan halaman pertama, terakhir, halaman aktif, dan 1 tetangga di kiri/kanannya.
                      .filter((page) =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - safePage) <= 1
                      )
                      .reduce((acc, page, idx, arr) => {
                        if (idx > 0 && page - arr[idx - 1] > 1) acc.push('ellipsis-' + page);
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((page) =>
                        typeof page === 'string' ? (
                          <span key={page} className="px-1.5 text-xs text-stone-400">…</span>
                        ) : (
                          <button
                            key={page}
                            type="button"
                            onClick={() => goToPage(page)}
                            className={`min-w-[28px] h-7 px-1 rounded-lg text-xs font-bold transition-all ${
                              page === safePage
                                ? 'bg-green-600 text-white'
                                : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                  </div>

                  <button
                    type="button"
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage === totalPages}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <DetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
    </div>
  );
};

export default MaintenanceHistory;