import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../services/ticketService';

export const useTicketDetail = (ticketId) => {
  const navigate                          = useNavigate();
  const [ticket, setTicket]               = useState(null);
  const [report, setReport]               = useState(null);
  const [isLoading, setIsLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError]                 = useState('');

  const shouldFetchReport = (status) =>
    ['WaitingApproval', 'Rejected', 'Done'].includes(status);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await ticketService.getTicketById(ticketId);
      setTicket(data);

      if (shouldFetchReport(data?.status)) {
        const reportData = await ticketService.getTicketReport(ticketId);
        setReport(reportData);
      } else {
        setReport(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat detail tiket.');
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (ticketId) fetchDetail();
  }, [fetchDetail, ticketId]);

  const handleAssign = async (leaderId, memberIds = [], notes = '') => {
    setActionLoading(true);
    setError('');
    try {
      await ticketService.assignEngineer(ticketId, leaderId, memberIds, notes);
      await fetchDetail();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menugaskan engineer.');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async (memberIds = []) => {
    setActionLoading(true);
    setError('');
    try {
      await ticketService.startWork(ticketId, memberIds);
      await fetchDetail();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memulai pekerjaan.');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleReassign = async (payload) => {
    setActionLoading(true);
    setError('');
    try {
      const result = await ticketService.updateAssignments(ticketId, payload);
      await fetchDetail();
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui penugasan tiket.');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (notes) => {
    setActionLoading(true);
    setError('');
    try {
      await ticketService.rejectTicket(ticketId, notes);
      await fetchDetail();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menolak laporan.');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    setError('');
    try {
      await ticketService.approveTicket(ticketId);
      await fetchDetail();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyetujui tiket.');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    setError('');
    try {
      await ticketService.deleteTicket(ticketId);
      navigate('/tiket');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus tiket.');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  return {
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
    refreshDetail: fetchDetail,
  };
};