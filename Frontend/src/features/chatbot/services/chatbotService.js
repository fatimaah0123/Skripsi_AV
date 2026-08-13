import api from '../../../services/api';

export const chatbotService = {
  sendMessage: async (message, sessionId) => {
    const payload = sessionId ? { message, sessionId } : { message };
    const res = await api.post('/api/chatbot', payload);
    return res.data?.data ?? {};
  },
};