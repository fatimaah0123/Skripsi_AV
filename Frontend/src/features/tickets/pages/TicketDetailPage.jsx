import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTicketDetail } from '../hooks/useTicketDetail';
import TicketDetailCard from '../components/TicketDetailCard';
import AssignModal from '../components/AssignModal';
import RejectModal from '../components/RejectModal';
import SubmitReportModal from '../components/SubmitReportModal';
import ReassignModal from '../components/ReassignModal';
import StartWorkModal from '../components/StartWorkModal';

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
        onDeleteClick={handleDelete}
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
    </div>
  );
};

export default TicketDetailPage;