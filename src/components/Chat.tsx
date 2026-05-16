import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

interface ChatProps {
  onSendMessage: (text: string) => void;
  onSkip: () => void;
}

export const Chat = ({ onSendMessage, onSkip }: ChatProps) => {
  const { messages, isConnected, isSearching } = useAppStore();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && isConnected) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white flex-1 min-w-0">
      {/* Message Area */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-scroll p-4 space-y-1 font-sans text-[14px] bg-white"
      >
        <div className="mb-4">
          <p className="text-zinc-600 font-bold">
            You're now chatting with a random stranger. Say hi!
          </p>
          <div className="h-px bg-[#eee] my-2" />
        </div>

        {messages.map((msg) => (
          <p key={msg.id} className="leading-tight break-all">
            <span 
              className={`font-bold ${msg.sender === 'me' ? 'text-omegle-blue' : 'text-red-600'}`}
            >
              {msg.sender === 'me' ? 'You: ' : 'Stranger: '}
            </span>
            <span className="text-zinc-800">{msg.text}</span>
          </p>
        ))}

        {!isConnected && isSearching && (
          <p className="text-zinc-400 font-bold italic mt-4">Looking for someone you can chat with...</p>
        )}
      </div>

      {/* Input Area */}
      <div className="h-[60px] md:h-[80px] border-t border-[#ddd] flex items-center bg-[#fafafa] shrink-0">
        {/* Stop/New Button */}
        <button
          onClick={onSkip}
          className="h-full w-[60px] md:w-[80px] flex flex-col items-center justify-center border-r border-[#ddd] hover:bg-[#eee] transition-colors group px-1"
        >
          <span className="text-sm md:text-[16px] font-bold text-zinc-700">Stop</span>
          <span className="hidden md:block text-[10px] text-zinc-400 font-bold mt-1 group-active:translate-y-px">Esc</span>
        </button>

        {/* Text Area */}
        <form onSubmit={handleSubmit} className="flex-1 h-full flex">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={isConnected ? "Type your message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1 h-full p-2 md:p-3 bg-white text-[13px] md:text-[14px] resize-none outline-none disabled:bg-zinc-50"
          />
          <button
            type="submit"
            disabled={!isConnected || !inputText.trim()}
            className="px-4 md:px-6 h-full font-bold text-zinc-500 hover:text-omegle-blue border-l border-[#ddd] transition-colors disabled:opacity-30 disabled:hover:text-zinc-500"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
