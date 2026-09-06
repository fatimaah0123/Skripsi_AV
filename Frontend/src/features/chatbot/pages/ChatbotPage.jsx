import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, User, Bot, Sparkles, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useChatbot } from '../hooks/useChatbot';

const ChatbotPage = () => {
  const {
    input,
    setInput,
    chatHistory,
    isLoading,
    scrollRef,
    handleSend,
    isClearDialogOpen,
    requestClearChat,
    cancelClearChat,
    confirmClearChat,
  } = useChatbot();

  return (
    <div className="flex flex-col h-[72vh] max-w-4xl mx-auto space-y-3 p-4 md:p-0">
      <div className="flex items-center justify-between bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-600 rounded-lg text-white">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-md font-bold text-gray-900 dark:text-white leading-none">AVATAR Copilot</h2>
            <p className="text-[10px] text-gray-500 dark:text-stone-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              AI Assistant Aktif
            </p>
          </div>
        </div>
        <button
          onClick={requestClearChat}
          className="p-2 text-gray-400 hover:text-red-500 transition-all rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
          title="Hapus riwayat percakapan"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar min-h-0 bg-white/30 dark:bg-stone-900/10 rounded-2xl p-2"
      >
        {chatHistory.map((chat, index) => (
          <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${chat.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm bg-cyan-600">
                {chat.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed
                ${chat.role === 'user' 
                  ? 'bg-cyan-600 text-white rounded-tr-none shadow-md shadow-cyan-600/10' 
                  : 'bg-white dark:bg-stone-800 text-gray-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-tl-none shadow-sm'}`}>
                {chat.role === 'user' ? (
                  chat.message
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>li]:mt-1">
                    <ReactMarkdown>{chat.message}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%] flex-row">
              <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm bg-cyan-600">
                <Bot size={14} className="text-white" />
              </div>
              <div className="p-3 rounded-2xl text-sm bg-white dark:bg-stone-800 text-gray-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-cyan-600" />
                <span className="text-xs text-stone-500 dark:text-stone-400">AVATAR AI sedang menganalisis...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="relative py-1 shrink-0">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan analisis mesin..."
            disabled={isLoading}
            className="w-full bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-2xl py-4 pl-6 pr-14 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 shadow-xl transition-all disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-lg transition-all active:scale-95 disabled:bg-gray-300 dark:disabled:bg-stone-800 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="text-[9px] text-center text-gray-400 mt-2 uppercase tracking-widest font-bold">
          Avatar Intelligent Prediction Engine
        </p>
      </form>

      {/* Modal konfirmasi hapus riwayat — menggantikan window.confirm */}
      {isClearDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={cancelClearChat}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-11 h-11 rounded-full bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle size={20} className="text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Hapus Riwayat Percakapan?
                </h3>
                <p className="text-xs text-gray-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                  Seluruh riwayat percakapan dengan AVATAR Copilot akan dihapus secara permanen dan tidak dapat dikembalikan.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={cancelClearChat}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
              >
                Batal
              </button>
              <button
                onClick={confirmClearChat}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all active:scale-95"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotPage;