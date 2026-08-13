import { useState, useEffect, useCallback } from 'react';
import { ticketService } from '../services/ticketService';

const useTickets = () => {
  const [tickets, setTickets]     = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await ticketService.getAllTickets();
      setTickets(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data tiket.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const updateTicketInState = (updatedTicket) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
    );
  };

  const handleAssign = async (ticketId, leaderId, memberIds = [], notes = '') => {
    await ticketService.assignEngineer(ticketId, leaderId, memberIds, notes);
    await fetchTickets();
  };

  const handleApprove = async (ticketId) => {
    const updated = await ticketService.approveTicket(ticketId);
    updateTicketInState(updated);
  };

  const handleStart = async (ticketId, memberIds = []) => {
    await ticketService.startWork(ticketId, memberIds);
    await fetchTickets();
  };

  const handleReject = async (ticketId, notes) => {
    const updated = await ticketService.rejectTicket(ticketId, notes);
    updateTicketInState(updated);
  };

  const handleDelete = async (ticketId) => {
    await ticketService.deleteTicket(ticketId);
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
  };

  return {
    tickets,
    isLoading,
    error,
    fetchTickets,
    handleAssign,
    handleApprove,
    handleStart,
    handleReject,
    handleDelete,
  };
};

export default useTickets;