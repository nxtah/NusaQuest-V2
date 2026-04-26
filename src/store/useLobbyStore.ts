import { create } from 'zustand';

interface LobbyState {
  selectedRoomId: number | string | null;
  setSelectedRoomId: (id: number | string | null) => void;
}

export const useLobbyStore = create<LobbyState>((set) => ({
  selectedRoomId: null, 
  setSelectedRoomId: (id) => set({ selectedRoomId: id }), 
}));