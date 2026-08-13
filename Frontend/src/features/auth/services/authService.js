import api from '../../../services/api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/auth', { email, password });
    const { accessToken, user } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));

    // Selalu kembalikan bentuk { user, accessToken } yang konsisten,
    // supaya pemanggil (AuthContext) tidak perlu menebak-nebak bentuk data.
    return { user, accessToken };
  },

  refreshToken: async () => {
    const response = await api.put('/api/auth');
    const { accessToken, user } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));

    return { user, accessToken };
  },

  logout: async () => {
    try {
      await api.delete('/api/auth');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
    }
  },
};