/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { VideoGrid } from './components/VideoGrid';
import { Chat } from './components/Chat';
import { useWebRTC } from './hooks/useWebRTC';
import { useAppStore } from './store/useAppStore';

export default function App() {
  const { startSearching, skip, sendMessage } = useWebRTC();
  const { isSearching, isConnected, onlineCount } = useAppStore();

  useEffect(() => {
    // Add Esc key listener for skipping
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [skip]);

  if (!isSearching && !isConnected) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white font-sans p-4">
        <div className="mb-12 flex flex-col items-center">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-5xl font-black italic tracking-tighter text-omegle-blue">omne</span>
            <span className="text-5xl font-black italic tracking-tighter text-omegle-orange">match</span>
          </div>
          <p className="text-xl font-bold tracking-tight text-zinc-600">Talk to strangers!</p>
        </div>

        <div className="bg-[#f7f7f7] border border-[#ddd] p-8 rounded-lg shadow-sm flex flex-col items-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-zinc-800">Ready to chat?</h2>
          <button
            onClick={startSearching}
            className="w-full py-4 bg-omegle-blue text-white font-bold text-xl rounded shadow-[0_2px_0_0_#003566] hover:bg-[#005cb3] active:translate-y-px active:shadow-none transition-all"
          >
            Video
          </button>
          <p className="mt-6 text-sm text-zinc-500 text-center leading-relaxed">
            By using OmniMatch, you agree to the terms. Please be respectful. 
            You must be 18+ or 13+ with parental consent.
          </p>
        </div>
        
        <div className="mt-12 text-zinc-400 text-xs font-bold uppercase tracking-widest">
          Classic Experience • Simplified
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-white">
      {/* Header */}
      <header className="h-[75px] border-b border-[#ddd] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => window.location.reload()}>
          <span className="text-4xl font-black italic tracking-tighter text-omegle-blue">omne</span>
          <span className="text-4xl font-black italic tracking-tighter text-omegle-orange">match</span>
        </div>
        
        <h2 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold text-zinc-900 hidden md:block">
          Talk to strangers!
        </h2>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Online</span>
            <span className="text-lg font-bold text-omegle-blue leading-none">{onlineCount}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        <VideoGrid />
        <Chat onSendMessage={sendMessage} onSkip={skip} />
      </main>
    </div>
  );
}
