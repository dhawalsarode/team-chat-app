import { create } from "zustand";
import { socket } from "../lib/socket";

interface OnlineUser {
  userId: string;
  connections: number;
  online: boolean;
}

interface PresenceState {
  users: Record<string, OnlineUser>;
  setPresence: (user: OnlineUser) => void;
}

export const usePresence = create<PresenceState>((set, get) => ({
  users: {},

  setPresence(user) {
    set({
      users: {
        ...get().users,
        [user.userId]: user
      }
    });
  }
}));

// Listen to presence updates from backend
socket.on("presence:update", (user: OnlineUser) => {
  usePresence.getState().setPresence(user);
});
