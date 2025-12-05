import { useEffect, useState } from "react";
import { socket } from "../lib/socket";

export default function TypingIndicator({ channelId }: { channelId: string }) {
  const [typingUser, setTypingUser] = useState<string | null>(null);

  useEffect(() => {
    function handler(username: string) {
      setTypingUser(username);
      // Clear after a short delay so it doesn’t stick forever
      setTimeout(() => setTypingUser(null), 1500);
    }

    socket.on("typing", handler);
    return () => {
      socket.off("typing", handler);
    };
  }, [channelId]);

  if (!typingUser) return null;

  return (
    <div className="text-xs text-slate-400 px-5 py-1">
      💬 {typingUser} is typing…
    </div>
  );
}
