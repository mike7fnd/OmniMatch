import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => void;
}

export const Chat = ({ isOpen, onClose, onSendMessage }: ChatProps) => {
  const { messages, isConnected } = useAppStore();
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute right-0 top-0 bottom-0 w-full md:w-80 bg-zinc-950 border-l border-white/5 z-50 flex flex-col shadow-xl"
        >
          <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Messages</h3>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-100 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center text-zinc-700 text-[10px] font-semibold uppercase tracking-widest">
                Empty
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] px-3 py-2 rounded-2xl text-[13px] font-medium leading-normal ${
                    msg.sender === 'me'
                      ? 'bg-zinc-100 text-zinc-900 rounded-tr-none'
                      : 'bg-zinc-900 text-zinc-300 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-zinc-600 mt-1.5 font-bold uppercase tracking-widest">
                  {msg.sender === 'me' ? 'You' : 'Partner'}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-4 bg-zinc-950 border-t border-white/5">
            <div className="relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isConnected ? "Message..." : "Waiting..."}
                disabled={!isConnected}
                className="w-full bg-zinc-900 text-zinc-100 rounded-full pl-5 pr-12 py-3 text-xs font-medium border border-transparent focus:border-zinc-700 focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!isConnected || !inputText.trim()}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full text-zinc-500 hover:text-zinc-100 disabled:opacity-0 transition-all"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
