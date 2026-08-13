import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';

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
        setDashboardData(data);
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