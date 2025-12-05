import { useState } from "react";
import { api } from "../lib/axios";
import { useMessages } from "../store/messages";
import { socket } from "../lib/socket";

interface Props {
  channelId: string;
  username?: string;
}

export default function MessageInput({ channelId, username = "You" }: Props) {
  const [text, setText] = useState("");
  const addLocal = useMessages(s => s.addMessage);

  async function send() {
    if (!text.trim()) return;

    const { data } = await api.post(`/messages/${channelId}`, {
      content: text
    });

    // Local optimistic update
    addLocal(data.message);
    setText("");
  }

  function handleChange(value: string) {
    setText(value);
    socket.emit("typing", channelId, username);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex gap-3">
      <input
        value={text}
        onChange={e => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 rounded-lg bg-surface border border-borderSubtle px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
        placeholder="Type a message..."
      />
      <button
        onClick={send}
        className="px-3 py-2 rounded-lg text-sm font-medium bg-accent hover:bg-accentSoft text-slate-900 transition"
      >
        Send
      </button>
    </div>
  );
}
