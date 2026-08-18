import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { useTicketDetail } from '../hooks/useTicketDetail';
import TicketDetailCard from '../components/TicketDetailCard';
import AssignModal from '../components/AssignModal';
import RejectModal from '../components/RejectModal';
import SubmitReportModal from '../components/SubmitReportModal';
import ReassignModal from '../components/ReassignModal';
import StartWorkModal from '../components/StartWorkModal';

// Menggantikan window.confirm() bawaan browser yang kaku ("localhost:5173 menyatakan...")
// dengan modal custom — gaya disamakan dengan DeleteConfirmDialog di MachineTable.jsx/UserTable.jsx
// supaya konsisten satu sistem.
const DeleteTicketConfirmDialog = ({ isOpen, isSubmitting, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 shrink-0 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h4 className="font-bold text-stone-900 dark:text-white">Hapus Tiket?</h4>
            <p className="text-xs text-stone-500 mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-6">
          Anda akan menghapus / membatalkan tiket pemeliharaan ini secara permanen.
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all text-sm disabled:opacity-60"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <><Loader2 size={14} className="animate-spin" /> Menghapus...</>
            ) : (
              'Ya, Hapus'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    ticket,
    report,
    isLoading,
    actionLoading,
    error,
    handleAssign,
    handleStart,
    handleReassign,
    handleReject,
    handleApprove,
    handleDelete,
    refreshDetail,
  } = useTicketDetail(id);

  // State untuk controlling modals
  const [showAssignModal, setShowAssignModal]     = useState(false);
  const [showRejectModal, setShowRejectModal]     = useState(false);
  const [showSubmitModal, setShowSubmitModal]     = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showStartModal, setShowStartModal]       = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const onDeleteConfirm = async () => {
    try {
      await handleDelete();
      // Kalau berhasil, hook sudah navigate('/tiket') — modal otomatis unmount bersama halaman.
    } catch {
      setShowDeleteConfirm(false);
    }
  };

  const onAssignConfirm = async (ticketId, leaderId, memberIds, notes) => {
    try {
      await handleAssign(leaderId, memberIds, notes);
      setShowAssignModal(false);
    } catch {
    }
  };

  const onRejectConfirm = async (ticketId, notes) => {
    try {
      await handleReject(notes);
      setShowRejectModal(false);
    } catch {
    }
  };

  const onStartConfirm = async (ticketId, memberIds) => {
    try {
      await handleStart(memberIds);
      setShowStartModal(false);
    } catch {
    }
  };

  const onReassignConfirm = async (ticketId, payload) => {
    try {
      await handleReassign(payload);
      setShowReassignModal(false);
    } catch {
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-stone-400 gap-2">
        <Loader2 className="animate-spin" size={20} />
        <span>Memuat detail tiket...</span>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="p-6 text-center">
        <p className="text-rose-500 font-semibold mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl font-bold text-sm"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-bold text-sm transition-colors"
      >
        <ArrowLeft size={16} /> Kembali
      </button>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Detail Card */}
      <TicketDetailCard
        ticket={ticket}
        report={report}
        actionLoading={actionLoading}
        onAssignClick={() => setShowAssignModal(true)}
        onStartClick={() => setShowStartModal(true)}
        onSubmitClick={() => setShowSubmitModal(true)}
        onApprove={handleApprove}
        onRejectClick={() => setShowRejectModal(true)}
        onReassignClick={() => setShowReassignModal(true)}
        onDeleteClick={() => setShowDeleteConfirm(true)}
      />

      {/* Modals */}
      {showAssignModal && (
        <AssignModal
          ticket={ticket}
          isSubmitting={actionLoading}
          onClose={() => setShowAssignModal(false)}
          onConfirm={onAssignConfirm}
        />
      )}

      {showRejectModal && (
        <RejectModal
          ticket={ticket}
          isSubmitting={actionLoading}
          onClose={() => setShowRejectModal(false)}
          onConfirm={onRejectConfirm}
        />
      )}

      {showSubmitModal && (
        <SubmitReportModal
          ticket={ticket}
          report={report}
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => {
            setShowSubmitModal(false);
            refreshDetail();
          }}
        />
      )}

      {showStartModal && (
        <StartWorkModal
          ticket={ticket}
          isSubmitting={actionLoading}
          onClose={() => setShowStartModal(false)}
          onConfirm={onStartConfirm}
        />
      )}

      {showReassignModal && (
        <ReassignModal
          ticket={ticket}
          isSubmitting={actionLoading}
          onClose={() => setShowReassignModal(false)}
          onConfirm={onReassignConfirm}
        />
      )}

      <DeleteTicketConfirmDialog
        isOpen={showDeleteConfirm}
        isSubmitting={actionLoading}
        onConfirm={onDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default TicketDetailPage;