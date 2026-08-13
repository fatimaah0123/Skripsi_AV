import api from '../../../services/api'; 

export const machineService = {

  getAll: async (search = '') => { 
    const params = search ? { search } : {}; 
    const res = await api.get('/api/machines', { params }); 
    return res.data?.data?.machines ?? []; 
  },

  getById: async (id) => { 
    const res = await api.get(`/api/machines/${id}`); 
    return res.data?.data?.machine ?? null; 
  },

  create: async (payload) => { 
    const res = await api.post('/api/machines', payload); 
    return res.data?.data?.machine ?? res.data?.data; 
  },

  update: async (id, payload) => { 
    const res = await api.put(`/api/machines/${id}`, payload); 
    return res.data?.data?.machine ?? res.data?.data; 
  },

  // Hapus mesin berdasarkan ID
  remove: async (id) => { 
    const res = await api.delete(`/api/machines/${id}`);
    return res.data;
  },
};