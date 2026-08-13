import { useState, useRef, useEffect } from 'react';
import { chatbotService } from '../services/chatbotService';

const INITIAL_BOT_MESSAGE = {
  role: 'bot',
  message: 'Halo! Saya AVATAR AI. Ada yang bisa saya bantu terkait analisis teknis atau reliabilitas mesin hari ini?',
};

const getChatbotErrorMessage = (err) => {
  const status         = err.response?.status;
  const backendMessage = err.response?.data?.message;
  const isRawAxiosMessage = backendMessage === err.message;

  if (status === 429) {
    return 'Terlalu banyak permintaan dalam waktu singkat. Mohon tunggu sebentar lalu coba lagi.';
  }
  if (status === 401) {
    return 'Sesi Anda telah berakhir. Silakan login ulang untuk melanjutkan percakapan.';
  }
  if (status === 500) {
    return 'Server AI sedang mengalami gangguan. Silakan coba beberapa saat lagi.';
  }
  if (backendMessage && !isRawAxiosMessage) {
    return backendMessage;
  }

  return 'Maaf, terjadi kendala koneksi ke server AI. Silakan coba beberapa saat lagi.';
};

export const useChatbot = () => {
  const [input, setInput]             = useState('');
  const [chatHistory, setChatHistory] = useState([INITIAL_BOT_MESSAGE]);
  const [isLoading, setIsLoading]     = useState(false);
  const [sessionId, setSessionId]     = useState(null); // dipakai backend untuk menjaga konteks percakapan
  const scrollRef                     = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    setChatHistory((prev) => [...prev, { role: 'user', message: userMessage }]);
    setIsLoading(true);

    try {
      const { answer, sessionId: newSessionId } = await chatbotService.sendMessage(userMessage, sessionId);

      setSessionId(newSessionId ?? sessionId);
      setChatHistory((prev) => [
        ...prev,
        { role: 'bot', message: answer || 'Maaf, tidak ada tanggapan dari server.' },
      ]);
    } catch (err) {
      console.error('Gagal mengirim pesan ke chatbot:', err);
      setChatHistory((prev) => [
        ...prev,
        { role: 'bot', message: getChatbotErrorMessage(err) },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Hapus semua riwayat percakapan?')) {
      setSessionId(null); // sesi baru dimulai dari awal
      setChatHistory([
        { role: 'bot', message: 'Riwayat dihapus. Ada lagi yang bisa saya bantu?' },
      ]);
    }
  };

  return {
    input,
    setInput,
    chatHistory,
    isLoading,
    scrollRef,
    handleSend,
    clearChat,
  };
};