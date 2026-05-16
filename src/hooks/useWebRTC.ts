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
    setOnlineCount,
    setSocketConnected,
    localStream,
    roomId,
    resetChat,
    mode,
  } = useAppStore();

  const roomIdRef = useRef<string | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

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
      console.log('Received remote track');
      setRemoteStream(event.streams[0]);
      setConnected(true);
      setSearching(false);
    };

    const tracks = localStreamRef.current?.getTracks();
    if (tracks && tracks.length > 0) {
      tracks.forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  }, [setRemoteStream, setConnected, setSearching]);

  const startSearching = useCallback(async (searchMode: 'text' | 'video' = 'video') => {
    cleanup();
    resetChat();
    setSearching(true);
    
    if (searchMode === 'video') {
      let stream = localStreamRef.current;
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 1280 }, 
              height: { ideal: 720 },
              facingMode: "user"
            }, 
            audio: {
              echoCancellation: true,
              noiseSuppression: true
            }
          });
          setLocalStream(stream);
          localStreamRef.current = stream;
        } catch (err) {
          console.error('Error accessing media devices:', err);
          // Fallback to text if video fails
          searchMode = 'text';
        }
      }
    } else {
      // If switching to text from video, we can keep the stream but not use it
    }

    if (socketRef.current) {
      if (!socketRef.current.connected) {
        socketRef.current.connect();
      }
      socketRef.current.emit('join-queue', { mode: searchMode });
    }
  }, [setLocalStream, setSearching, cleanup, resetChat]);

  const skip = useCallback(() => {
    if (roomIdRef.current) {
      socketRef.current?.emit('skip', { roomId: roomIdRef.current });
    }
    const currentMode = useAppStore.getState().mode;
    cleanup();
    resetChat();
    startSearching(currentMode);
  }, [cleanup, resetChat, startSearching]);

  const sendMessage = useCallback((text: string) => {
    if (roomIdRef.current && socketRef.current) {
      socketRef.current.emit('send-message', { roomId: roomIdRef.current, message: text });
      addMessage({ text, sender: 'me' });
    }
  }, [addMessage]);

  useEffect(() => {
    const socket = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketConnected(false);
    });

    socket.on('match-found', async ({ roomId: newRoomId, initiator, mode: matchedMode }) => {
      console.log('Match found! Room:', newRoomId, 'Initiator:', initiator, 'Mode:', matchedMode);
      setMatch(newRoomId, null, matchedMode);
      
      if (matchedMode === 'video') {
        const pc = createPeerConnection(newRoomId);

        if (initiator) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('signal', { roomId: newRoomId, signal: offer });
        }
      } else {
        // Text mode
        setConnected(true);
        setSearching(false);
      }
    });

    socket.on('signal', async ({ signal }) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      try {
        if (signal.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          if (roomIdRef.current) {
            socket.emit('signal', { roomId: roomIdRef.current, signal: answer });
          }
        } else if (signal.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
        } else if (signal.type === 'candidate') {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (err) {
        console.error('Signaling error:', err);
      }
    });

    socket.on('message', (text: string) => {
      addMessage({ text, sender: 'partner' });
    });

    socket.on('partner-disconnected', () => {
      console.log('Partner disconnected');
      skip();
    });

    socket.on('partner-skipped', () => {
      console.log('Partner skipped');
      skip();
    });

    socket.on('online-count', (count: number) => {
      setOnlineCount(count);
    });

    return () => {
      socket.disconnect();
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once! Add callbacks to refs if needed, but here they are stable or handle state internally.


  return { startSearching, skip, sendMessage };
};
