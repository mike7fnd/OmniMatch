import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

export const VideoGrid = () => {
  const { localStream, remoteStream, isCameraOff, mode } = useAppStore();
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

  if (mode === 'text') {
    return null; // Don't show video grid in text mode
  }

  return (
    <div className="flex flex-col h-auto max-h-[50vh] md:max-h-none md:h-full w-full md:w-[320px] lg:w-[400px] shrink-0 border-r border-[#ddd] bg-[#f4f4f4] overflow-hidden">
      {/* Remote Video */}
      <div className="video-box flex-1 min-h-[150px]">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-contain"
        />
        {!remoteStream && (
          <div className="absolute inset-0 flex items-center justify-center text-white/20 select-none">
            <span className="text-2xl md:text-4xl font-bold italic">OMNOMATCH</span>
          </div>
        )}
      </div>

      {/* Local Video */}
      <div className="video-box flex-1 min-h-[150px]">
        {isCameraOff ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black text-white/20">
            <span className="text-xl">Camera Off</span>
          </div>
        ) : (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain scale-x-[-1]"
          />
        )}
      </div>
    </div>
  );
};
