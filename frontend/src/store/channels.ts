import { create } from "zustand";
import { api } from "../lib/axios";

export interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
}

interface ChannelState {
  channels: Channel[];
  activeChannel: Channel | null;
  loadChannels: () => Promise<void>;
  setActiveChannel: (id: string) => void;
}

export const useChannels = create<ChannelState>((set, get) => ({
  channels: [],
  activeChannel: null,

  async loadChannels() {
    const { data } = await api.get("/channels/list");
    set({ channels: data.channels });
  },

  setActiveChannel(id) {
    const found = get().channels.find(c => c.id === id) || null;
    set({ activeChannel: found });
  }
}));
