import { create } from 'zustand';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'partner';
  timestamp: number;
}

interface AppState {
  isSearching: boolean;
  isConnected: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  messages: Message[];
  partnerId: string | null;
  roomId: string | null;
  isMuted: boolean;
  isCameraOff: boolean;
  onlineCount: number;
  
  setSearching: (searching: boolean) => void;
  setConnected: (connected: boolean) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setMatch: (roomId: string | null, partnerId: string | null) => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  resetChat: () => void;
  setOnlineCount: (count: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSearching: false,
  isConnected: false,
  localStream: null,
  remoteStream: null,
  messages: [],
  partnerId: null,
  roomId: null,
  isMuted: false,
  isCameraOff: false,
  onlineCount: 0,

  setSearching: (isSearching) => set({ isSearching }),
  setConnected: (isConnected) => set({ isConnected }),
  setLocalStream: (localStream) => set({ localStream }),
  setRemoteStream: (remoteStream) => set({ remoteStream }),
  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, { ...msg, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() }]
  })),
  setMatch: (roomId, partnerId) => set({ roomId, partnerId }),
  toggleMute: () => set((state) => {
    if (state.localStream) {
      state.localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    }
    return { isMuted: !state.isMuted };
  }),
  toggleCamera: () => set((state) => {
    if (state.localStream) {
      state.localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    }
    return { isCameraOff: !state.isCameraOff };
  }),
  resetChat: () => set({ messages: [] }),
  setOnlineCount: (onlineCount) => set({ onlineCount }),
}));
