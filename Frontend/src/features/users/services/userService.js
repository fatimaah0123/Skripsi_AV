import api from '../../../services/api';

export const userService = {
  getAll: async (search = '') => {
    const params = search ? { search } : {};
    const res = await api.get('/api/users', { params });
    return res.data?.data?.users || [];
  },

  create: async (payload) => {
    const res = await api.post('/api/users', payload);
    return res.data?.data?.user;
  },

  update: async (id, payload) => {
    const res = await api.put(`/api/users/${id}`, payload);
    return res.data?.data?.user;
  },

  remove: async (id) => {
    await api.delete(`/api/users/${id}`);
  },
};