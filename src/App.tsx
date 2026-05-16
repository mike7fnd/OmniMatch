/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoGrid } from './components/VideoGrid';
import { Controls } from './components/Controls';
import { Chat } from './components/Chat';
import { useWebRTC } from './hooks/useWebRTC';
import { useAppStore } from './store/useAppStore';
import { Circle } from 'lucide-react';

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { startSearching, skip, sendMessage } = useWebRTC();
  const { isSearching, isConnected } = useAppStore();

  const handleToggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);

  return (
    <div className="relative h-screen w-full flex flex-col bg-zinc-950 font-sans">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#27272a,transparent)]" />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Circle className="fill-zinc-100 text-zinc-100" size={14} />
          <h1 className="text-sm font-semibold tracking-tight text-zinc-100">OMNIMATCH</h1>
        </div>
        
        <div className="flex items-center gap-4 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Active
          </div>
          <span className="opacity-30">/</span>
          <span>Global Network</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-5xl h-full flex flex-col p-4">
          <VideoGrid />
        </div>
        
        <Controls 
          onStart={startSearching}
          onSkip={skip}
          onToggleChat={handleToggleChat}
        />
      </main>

      <Chat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        onSendMessage={sendMessage}
      />

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 flex items-center justify-between text-[10px] text-zinc-600 font-medium tracking-widest uppercase opacity-60">
        <p>© 2026</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Terms</a>
        </div>
      </footer>

      {/* Hero Landing */}
      <AnimatePresence>
        {!isSearching && !isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-xl"
            >
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-100 mb-4 px-4">
                Connect with the world, instantly.
              </h1>
              <p className="text-zinc-500 text-sm md:text-base font-normal tracking-normal mb-10 max-w-md mx-auto leading-relaxed">
                A minimal space for genuine video conversations with people from around the globe. No sign ups. No clutter.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startSearching}
                className="bg-zinc-100 text-zinc-950 px-10 py-3.5 rounded-full font-semibold text-sm tracking-wide transition-all hover:bg-white"
              >
                Start Chatting
              </motion.button>

              <div className="mt-20 text-[10px] font-semibold text-zinc-600 uppercase tracking-[0.3em]">
                Live Connections Established Every Second
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
