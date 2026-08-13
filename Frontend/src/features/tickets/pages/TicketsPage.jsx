import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket, AlertCircle, Clock, FileCheck,
  CheckCircle2, RefreshCw, ChevronRight, RotateCcw, XCircle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import useTickets from '../hooks/useTickets';
import TicketStatusBadge from '../components/TicketStatusBadge';
import AssignModal from '../components/AssignModal';
import RejectModal from '../components/RejectModal';

const ADMIN_TABS = [
  { key: 'WaitingAssignment', label: 'Belum Ditugaskan', icon: AlertCircle, color: 'text-yellow-600 border-yellow-500 bg-yellow-50/40' },
  { key: 'Assigned',          label: 'Ditugaskan',       icon: Clock,       color: 'text-purple-600 border-purple-500 bg-purple-50/40' },
  { key: 'InProgress',        label: 'Sedang Dikerjakan',icon: Clock,       color: 'text-blue-600   border-blue-500   bg-blue-50/40'   },
  { key: 'WaitingApproval',   label: 'Review Laporan',   icon: FileCheck,   color: 'text-orange-600 border-orange-500 bg-orange-50/40' },
  { key: 'Rejected',          label: 'Ditolak / Revisi', icon: RotateCcw,   color: 'text-rose-600   border-rose-500   bg-rose-50/40'   },
  { key: 'Done',              label: 'Selesai',          icon: CheckCircle2,color: 'text-green-600  border-green-500  bg-green-50/40'  },
];

const ENGINEER_TABS = [
  { key: 'Assigned',        label: 'Ditugaskan',         icon: Clock,       color: 'text-purple-600 border-purple-500 bg-purple-50/40' },
  { key: 'InProgress',      label: 'Sedang Dikerjakan',  icon: Clock,       color: 'text-blue-600   border-blue-500   bg-blue-50/40'   },
  { key: 'Rejected',        label: 'Ditolak / Revisi',   icon: RotateCcw,   color: 'text-rose-600   border-rose-500   bg-rose-50/40'   },
  { key: 'WaitingApproval', label: 'Menunggu Approval',  icon: AlertCircle, color: 'text-orange-600 border-orange-500 bg-orange-50/40' },
  { key: 'Done',            label: 'Selesai',            icon: CheckCircle2,color: 'text-green-600  border-green-500  bg-green-50/40'  },
];

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const TicketsPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { tickets, isLoading, error, handleAssign, handleApprove, handleReject } = useTickets();

  const tabs       = isAdmin ? ADMIN_TABS : ENGINEER_TABS;
  const defaultTab = isAdmin ? 'WaitingAssignment' : 'Assigned';

  const [activeTab, setActiveTab]       = useState(defaultTab);
  const [assignTarget, setAssignTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError]   = useState('');

  const filtered = tickets.filter((t) => t.status === activeTab);
  const countByStatus = (status) => tickets.filter((t) => t.status === status).length;

  const onAssignConfirm = async (ticketId, leaderId, memberIds, notes) => {
    setIsSubmitting(true);
    setActionError('');
    try {
      await handleAssign(ticketId, leaderId, memberIds, notes);
      setAssignTarget(null);
      setActiveTab('Assigned');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Gagal menugaskan engineer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRejectConfirm = async (ticketId, notes) => {
    setIsSubmitting(true);
    setActionError('');
    try {
      await handleReject(ticketId, notes);
      setRejectTarget(null);
      setActiveTab('Rejected'); 
    } catch (err) {
      setActionError(err.response?.data?.message || 'Gagal menolak laporan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
          <Ticket size={22} />
        </div>
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">
            Tiket Pemeliharaan
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {isAdmin ? 'Kelola alur kerja perbaikan mesin industri' : 'Daftar tiket yang ditugaskan kepada Anda'}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-48 gap-3 text-stone-400">
          <RefreshCw size={18} className="animate-spin" />
          <span className="text-sm">Memuat data tiket...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* TAB HEADERS */}
          <div className="flex flex-wrap gap-1 border-b border-stone-200 dark:border-stone-800">
            {tabs.map(({ key, label, icon: Icon, color }) => {
              const isActive = activeTab === key;
              const count    = countByStatus(key);
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-bold rounded-t-xl border-b-2 transition-all relative cursor-pointer ${
                    isActive
                      ? `${color} border-current`
                      : 'text-stone-500 dark:text-stone-400 border-transparent hover:text-stone-700 dark:hover:text-white'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                  {count > 0 && (
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                      key === 'Rejected'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : isActive
                        ? 'bg-current/20'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* LIST TIKET */}
          {filtered.length === 0 ? (
            <div className="bg-stone-50 dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl p-12 text-center">
              <p className="text-stone-400 text-sm">Tidak ada tiket di kategori ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group flex flex-col gap-3"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <TicketStatusBadge status={ticket.status} size="sm" />
                      <span className="text-xs text-stone-400 font-mono">#{ticket.id}</span>
                    </div>
                    <ChevronRight size={16} className="text-stone-300 group-hover:text-blue-500 transition-colors shrink-0 mt-0.5" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                      {ticket.machine_name}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{ticket.type}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-stone-500 dark:text-stone-400">{formatDate(ticket.created_at)}</span>
                  </div>

                  {isAdmin && ticket.status === 'WaitingAssignment' && (
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 mt-auto">
                      <button
                        onClick={(e) => { e.stopPropagation(); setAssignTarget(ticket); }}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 hover:border-purple-600 text-xs font-bold rounded-xl transition-all"
                      >
                        Tugaskan Engineer
                      </button>
                    </div>
                  )}

                  {isAdmin && ticket.status === 'WaitingApproval' && (
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 mt-auto flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setRejectTarget(ticket); }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 text-xs font-bold rounded-xl transition-all"
                      >
                        <XCircle size={13} /> Tolak
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleApprove(ticket.id); }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
                      >
                        <CheckCircle2 size={13} /> Setujui
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ASSIGN MODAL */}
      {assignTarget && (
        <AssignModal
          ticket={assignTarget}
          onConfirm={onAssignConfirm}
          onClose={() => { setAssignTarget(null); setActionError(''); }}
          isSubmitting={isSubmitting}
        />
      )}

      {/* REJECT MODAL */}
      {rejectTarget && (
        <RejectModal
          ticket={rejectTarget}
          onConfirm={onRejectConfirm}
          onClose={() => { setRejectTarget(null); setActionError(''); }}
          isSubmitting={isSubmitting}
        />
      )}

      {/* ERROR TOAST */}
      {actionError && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-3 bg-red-600 text-white text-sm rounded-xl shadow-lg">
          {actionError}
        </div>
      )}
    </div>
  );
};

export default TicketsPage;