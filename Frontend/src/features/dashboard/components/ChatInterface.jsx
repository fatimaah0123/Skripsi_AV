import { useState, useEffect, useRef } from 'react';

const ChatInterface = ({ userChat, botChat, setUserChat, chatBotAnswer }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  const initialBotMessage = 'Halo! Ada yang bisa saya bantu?';

  const handleSend = async () => {
    if (!input.trim()) return;

    setUserChat((prev) => [...(prev || []), input]);
    setInput('');

    await chatBotAnswer(input);
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [userChat, botChat]);

  const safeUserChat = userChat || [];
  const safeChatBot  = botChat || [];
  const messages = [
    { role: 'assistant', text: initialBotMessage },
    ...safeUserChat
      .map((text, i) => [
        { role: 'user', text },
        { role: 'assistant', text: safeChatBot[i] || '' },
      ])
      .flat(),
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-800 dark:text-white">
        Virtual Assistant
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                msg.role === 'user'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tanyakan sesuatu..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-cyan-500 text-white text-sm font-medium rounded-lg hover:bg-cyan-600 transition"
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;