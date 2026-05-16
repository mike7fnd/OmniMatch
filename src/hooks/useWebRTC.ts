import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '../store/useAppStore';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const useWebRTC = () => {
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const {
    setSearching,
    setConnected,
    setLocalStream,
    setRemoteStream,
    setMatch,
    addMessage,
    localStream,
    roomId,
    resetChat,
  } = useAppStore();

  const cleanup = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setRemoteStream(null);
    setConnected(false);
    setMatch(null, null);
  }, [setRemoteStream, setConnected, setMatch]);

  const createPeerConnection = useCallback((targetRoomId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('signal', {
          roomId: targetRoomId,
          signal: { type: 'candidate', candidate: event.candidate },
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      setConnected(true);
      setSearching(false);
    };

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  }, [localStream, setRemoteStream, setConnected, setSearching]);

  const startSearching = useCallback(async () => {
    if (!localStream) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
      } catch (err) {
        console.error('Error accessing media devices:', err);
        alert('Please allow camera and microphone access to use this app.');
        return;
      }
    }

    cleanup();
    setSearching(true);
    socketRef.current?.emit('join-queue');
  }, [localStream, setLocalStream, setSearching, cleanup]);

  const skip = useCallback(() => {
    if (roomId) {
      socketRef.current?.emit('skip', { roomId });
    }
    cleanup();
    resetChat();
    startSearching();
  }, [roomId, cleanup, resetChat, startSearching]);

  const sendMessage = useCallback((text: string) => {
    if (roomId && socketRef.current) {
      socketRef.current.emit('send-message', { roomId, message: text });
      addMessage({ text, sender: 'me' });
    }
  }, [roomId, addMessage]);

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on('match-found', async ({ roomId: newRoomId, initiator }) => {
      setMatch(newRoomId, null);
      const pc = createPeerConnection(newRoomId);

      if (initiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current?.emit('signal', { roomId: newRoomId, signal: offer });
      }
    });

    socketRef.current.on('signal', async ({ signal }) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      if (signal.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current?.emit('signal', { roomId, signal: answer });
      } else if (signal.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
      } else if (signal.type === 'candidate') {
        await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    });

    socketRef.current.on('message', (text: string) => {
      addMessage({ text, sender: 'partner' });
    });

    socketRef.current.on('partner-disconnected', () => {
      skip();
    });

    socketRef.current.on('partner-skipped', () => {
      skip();
    });

    return () => {
      socketRef.current?.disconnect();
      cleanup();
    };
  }, [roomId, createPeerConnection, addMessage, skip, setMatch, cleanup]);

  return { startSearching, skip, sendMessage };
};
