import { create } from "zustand";
import { api } from "../lib/axios";
import { socket } from "../lib/socket";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  channelId: string;
  user?: { username: string };
}

interface MsgState {
  messages: Message[];
  nextCursor: string | null;
  loadMessages: (channelId: string) => Promise<void>;
  loadOlder: (channelId: string) => Promise<void>;
  addMessage: (msg: Message) => void;
  clear: () => void;
}

export const useMessages = create<MsgState>((set, get) => ({
  messages: [],
  nextCursor: null,

  async loadMessages(channelId) {
    const { data } = await api.get(`/messages/${channelId}?limit=25`);
    // Join socket room after initial load
    socket.emit("join:channel", channelId);
    set({ messages: data.messages, nextCursor: data.nextCursor });
  },

  async loadOlder(channelId) {
    if (!get().nextCursor) return;
    const { data } = await api.get(
      `/messages/${channelId}?limit=25&cursor=${get().nextCursor}`
    );
    set({
      messages: [...data.messages, ...get().messages],
      nextCursor: data.nextCursor
    });
  },

  addMessage(msg) {
    set({ messages: [...get().messages, msg] });
  },

  clear() {
    set({ messages: [], nextCursor: null });
  }
}));

// Listen globally for new messages from backend
socket.on("message:new", (msg: Message) => {
  const { addMessage } = useMessages.getState();
  addMessage(msg);
});
