import React from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Video, VideoOff, SkipForward, Play, MessageSquare } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface ControlsProps {
  onStart: () => void;
  onSkip: () => void;
  onToggleChat: () => void;
}

export const Controls = ({ onStart, onSkip, onToggleChat }: ControlsProps) => {
  const { isSearching, isConnected, isMuted, isCameraOff, toggleMute, toggleCamera } = useAppStore();

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-zinc-900/40 backdrop-blur-2xl p-2 rounded-full border border-white/5 shadow-2xl z-20">
      {!isSearching && !isConnected ? (
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="flex items-center gap-2 bg-zinc-100 text-zinc-950 px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-colors"
        >
          <Play size={14} fill="currentColor" />
          Start Session
        </motion.button>
      ) : (
        <>
          <div className="flex items-center gap-1.5 px-2">
            <IconButton
              onClick={toggleMute}
              active={!isMuted}
              icon={isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            />
            <IconButton
              onClick={toggleCamera}
              active={!isCameraOff}
              icon={isCameraOff ? <VideoOff size={16} /> : <Video size={16} />}
            />
            <IconButton
              onClick={onToggleChat}
              active={true}
              icon={<MessageSquare size={16} />}
            />
          </div>
          
          <div className="w-px h-6 bg-white/10" />
          
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSkip}
            className="flex items-center gap-2 bg-zinc-100 text-zinc-950 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all"
          >
            <SkipForward size={14} />
            {isConnected ? 'Next' : 'Skip'}
          </motion.button>
        </>
      )}
    </div>
  );
};

const IconButton = ({ onClick, active, icon }: { onClick: () => void; active: boolean; icon: React.ReactNode }) => (
  <motion.button
    whileHover={{ scale: 1.05, bg: 'rgba(255,255,255,0.1)' }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`p-2.5 rounded-full transition-all duration-200 ${
      active 
        ? 'text-zinc-400 hover:text-zinc-100' 
        : 'text-red-400 bg-red-400/10'
    }`}
  >
    {icon}
  </motion.button>
);
