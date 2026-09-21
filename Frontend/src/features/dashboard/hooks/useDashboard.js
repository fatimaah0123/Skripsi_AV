import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { ticketService } from '../../tickets/services/ticketService';

const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await dashboardService.getDashboardData();
        if (!data) {
          throw new Error('Format data yang diterima dari server tidak valid.');
        }

        const rawTickets = data.latest_tickets || [];
        const enrichedTickets = await Promise.all(
          rawTickets.map(async (ticket) => {
            try {
              const detail = await ticketService.getTicketById(ticket.id);
              return { ...ticket, priority: detail?.priority };
            } catch {
              return ticket;
            }
          })
        );

        setDashboardData({ ...data, latest_tickets: enrichedTickets });
      } catch (err) {
        setError(err.message || err.response?.data?.message || 'Gagal memuat data dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { dashboardData, isLoading, error };
};

export default useDashboard;