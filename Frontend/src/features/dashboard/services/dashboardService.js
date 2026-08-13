import api from '../../../services/api';

export const dashboardService = {
  getDashboardData: async () => {
    const response = await api.get('/api/dashboard');
    return response.data?.data || response.data || response;
  },
};