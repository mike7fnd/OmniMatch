import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

export const VideoGrid = () => {
  const { localStream, remoteStream, isCameraOff } = useAppStore();
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
    <div className="flex flex-col h-full w-[400px] shrink-0 border-r border-[#ddd] bg-[#f4f4f4]">
      {/* Remote Video */}
      <div className="video-box flex-1">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-contain"
        />
        {!remoteStream && (
          <div className="absolute inset-0 flex items-center justify-center text-white/20 select-none">
            <span className="text-4xl font-bold italic">OMNOMATCH</span>
          </div>
        )}
      </div>

      {/* Local Video */}
      <div className="video-box flex-1">
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
