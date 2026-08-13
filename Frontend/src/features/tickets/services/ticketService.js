import api from '../../../services/api';

export const ticketService = {
  getAllTickets: async () => {
    const res = await api.get('/api/ticket-maintenance');
    return res.data?.data?.tickets || [];
  },

  getTicketById: async (id) => {
    const res = await api.get(`/api/ticket-maintenance/${id}`);
    return res.data?.data?.ticket || null;
  },

  assignEngineer: async (id, leaderId, memberIds = [], notes = '') => {
    const res = await api.patch(`/api/ticket-maintenance/${id}/assign`, {
      leader_id: String(leaderId),
      member_ids: memberIds.map(String),
      notes,
    });
    return res.data?.data?.ticket;
  },

  startWork: async (id, memberIds = []) => {
    const body = memberIds.length ? { member_ids: memberIds.map(String) } : {};
    const res = await api.patch(`/api/ticket-maintenance/${id}/start`, body);
    return res.data?.data?.ticket;
  },

  submitReport: async (id, formData) => {
    const res = await api.patch(`/api/ticket-maintenance/${id}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data?.ticket;
  },

  rejectTicket: async (id, notes) => {
    const res = await api.patch(`/api/ticket-maintenance/${id}/reject`, {
      notes,
    });
    return res.data?.data?.ticket;
  },

  approveTicket: async (id) => {
    const res = await api.patch(`/api/ticket-maintenance/${id}/approve`);
    return res.data?.data?.ticket;
  },

  updateAssignments: async (id, { leaderId, addMemberIds = [], removeMemberIds = [] } = {}) => {
    const body = {};
    if (leaderId) body.leader_id = String(leaderId);
    if (addMemberIds.length) body.add_member_ids = addMemberIds.map(String);
    if (removeMemberIds.length) body.remove_member_ids = removeMemberIds.map(String);

    const res = await api.patch(`/api/ticket-maintenance/${id}/assignments`, body);
    return res.data?.data; 
  },

  getTicketReport: async (id) => {
    try {
      const res = await api.get(`/api/ticket-maintenance/${id}/report`);
      return res.data?.data?.report || null;
    } catch (err) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  getEngineers: async () => {
    const res = await api.get('/api/users');
    const users = res.data?.data?.users || [];
    return users.filter((u) => u.role === 'Engineer');
  },

  deleteTicket: async (id) => {
    const res = await api.delete(`/api/ticket-maintenance/${id}`);
    return res.data;
  },
};