import React, { useState } from 'react';

interface ChatAssistantProps {
  imageName: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ imageName }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    const userMsg = currentMessage;
    setCurrentMessage('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setSendingChat(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_name: imageName, message: userMsg }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'ai', content: data.response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't process that request. Please try again." }]);
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <div className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${chatOpen ? 'w-[400px] h-[600px]' : 'w-16 h-16'}`}>
      {!chatOpen ? (
        <button
          onClick={() => setChatOpen(true)}
          className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 shadow-2xl flex items-center justify-center text-white transition-transform hover:scale-110"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </button>
      ) : (
        <div className="w-full h-full glass-card flex flex-col overflow-hidden shadow-2xl border border-white/20">
          <div className="p-4 bg-blue-600/20 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Docker AI Assistant
            </h3>
            <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
            {chatMessages.length === 0 && (
              <div className="text-center text-slate-500 mt-10 text-sm">
                <p>👋 Ask me anything about this image!</p>
                <p className="mt-2 text-xs">"How do I run this safely?"<br />"Where is the config file?"</p>
              </div>
            )}
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-700 text-slate-200 rounded-tl-none'
                  }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {sendingChat && (
              <div className="flex justify-start">
                <div className="bg-slate-700 p-3 rounded-2xl rounded-tl-none flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
            />
            <button
              type="submit"
              disabled={sendingChat || !currentMessage.trim()}
              className="p-2 bg-blue-600 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
