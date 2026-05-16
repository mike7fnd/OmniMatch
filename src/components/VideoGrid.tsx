import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { User } from 'lucide-react';

export const VideoGrid = () => {
  const { localStream, remoteStream, isSearching, isConnected, isCameraOff } = useAppStore();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="relative w-full h-full grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
      {/* Remote Video */}
      <div className="video-container relative flex items-center justify-center bg-zinc-900 group">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-700 ${remoteStream ? 'opacity-100' : 'opacity-0'}`}
        />
        {!remoteStream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700">
            <motion.div
              animate={isSearching ? { opacity: [0.3, 1, 0.3] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <User size={48} strokeWidth={1} />
            </motion.div>
            <p className="mt-6 text-[10px] font-semibold tracking-[0.2em] uppercase text-zinc-600">
              {isSearching ? 'Matching...' : 'Standby'}
            </p>
          </div>
        )}
        {isConnected && remoteStream && (
          <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-950/40 backdrop-blur-md border border-white/5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="text-[9px] font-bold text-zinc-100 uppercase tracking-widest">Partner</span>
          </div>
        )}
      </div>

      {/* Local Video */}
      <div className="video-container relative flex items-center justify-center bg-zinc-900 md:h-auto h-52 sm:h-64">
        {isCameraOff ? (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 text-zinc-800">
            <User size={32} strokeWidth={1} />
          </div>
        ) : (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        )}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-950/40 backdrop-blur-md border border-white/5">
          <span className="text-[9px] font-bold text-zinc-100 uppercase tracking-widest">You</span>
        </div>
      </div>
    </div>
  );
};
