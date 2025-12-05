import React, { useEffect, useState } from "react";
import { useAuth } from "./store/auth";
import { useChannels } from "./store/channels";
import { useMessages } from "./store/messages";
import { api, setAuthToken } from "./lib/axios";
import { socket } from "./lib/socket";
import MessageInput from "./components/MessageInput";

/* ---------- Auth screen ---------- */

const AuthScreen: React.FC = () => {
  const login = useAuth((s) => s.login);
  const register = useAuth((s) => s.register);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    let ok = false;

    if (isLogin) {
      ok = await login(email, password);
    } else {
      ok = await register(email, username, password);
      if (ok) {
        // After a successful registration, switch to sign-in mode
        setIsLogin(true);
      }
    }

    setLoading(false);

    if (!ok) {
      setError("Request failed. Check your details and that the backend (port 4000) is running.");
    }
  }

  return (
    <div className="min-h-screen bg-background text-slate-100 flex items-center justify-center">
      <div className="w-80 bg-surface p-6 rounded-xl space-y-4 border border-borderSubtle">
        <h1 className="text-xl font-semibold text-center">
          {isLogin ? "Sign in" : "Create account"}
        </h1>

        <input
          className="w-full p-2 rounded bg-surfaceAlt border border-borderSubtle text-sm"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {!isLogin && (
          <input
            className="w-full p-2 rounded bg-surfaceAlt border border-borderSubtle text-sm"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        <input
          className="w-full p-2 rounded bg-surfaceAlt border border-borderSubtle text-sm"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          className="w-full p-2 rounded bg-accent text-black font-semibold text-sm disabled:opacity-60"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Please wait…" : isLogin ? "Sign in" : "Register"}
        </button>

        <p
          className="text-xs text-center text-slate-400 cursor-pointer hover:text-slate-200"
          onClick={() => setIsLogin((v) => !v)}
        >
          {isLogin ? "No account? Register" : "Have an account? Sign in"}
        </p>
      </div>
    </div>
  );
};

/* ---------- Chat layout when logged in ---------- */

const ChatLayout: React.FC = () => {
  const token = useAuth((s) => s.token);

  const loadChannels = useChannels((s) => s.loadChannels);
  const channels = useChannels((s) => s.channels);
  const activeChannel = useChannels((s) => s.activeChannel);
  const setActiveChannel = useChannels((s) => s.setActiveChannel);

  const messages = useMessages((s) => s.messages);
  const loadMessages = useMessages((s) => s.loadMessages);
  const clearMessages = useMessages((s) => s.clear);

  useEffect(() => {
    if (!token) return;

    // set axios auth header
    setAuthToken(token);

    // connect socket once
    socket.connect();
    socket.emit("identify", "demo-user"); // later: real user id

    // load channels from backend
    loadChannels();
  }, [token, loadChannels]);

  async function openChannel(id: string) {
    // Clear old messages from previous channel
    clearMessages();
    setActiveChannel(id);

    // 🔥 IMPORTANT: join the channel on the backend so user becomes a member
    try {
      await api.post(`/channels/${id}/join`);
    } catch (err) {
      console.error("join channel failed (may already be a member):", err);
      // ignore error here; if they are already a member, backend will likely 409/400
    }

    // Now we can safely load messages
    await loadMessages(id);
  }

  return (
    <div className="min-h-screen bg-background text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-borderSubtle bg-surface flex flex-col">
        <div className="px-5 py-4 border-b border-borderSubtle">
          <h1 className="text-lg font-semibold tracking-tight">
            Mini Team Chat
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time channels · Message history
          </p>
        </div>

        <div className="px-3 py-3 space-y-1 overflow-y-auto">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
            Channels
          </div>

          {channels.length === 0 && (
            <div className="text-xs text-slate-500">No channels yet.</div>
          )}

          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => openChannel(ch.id)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition ${
                activeChannel?.id === ch.id
                  ? "bg-accent text-black"
                  : "hover:bg-slate-800"
              }`}
            >
              {ch.name}
            </button>
          ))}
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col bg-surfaceAlt">
        {!activeChannel && (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Select a channel to start chatting.
          </div>
        )}

        {activeChannel && (
          <>
            <header className="px-5 py-4 border-b border-borderSubtle flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">
                  {activeChannel.name}
                </div>
                <div className="text-xs text-slate-400">
                  {messages.length} messages loaded
                </div>
              </div>
            </header>

            <section className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-xs text-slate-500 text-center">
                  No messages yet. Say something!
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className="bg-surface p-2 rounded border border-borderSubtle"
                >
                  <div className="text-xs text-slate-400">
                    {m.user?.username ?? "User"}
                  </div>
                  <div className="text-sm">{m.content}</div>
                </div>
              ))}
            </section>

            <footer className="border-t border-borderSubtle px-5 py-3">
              <MessageInput channelId={activeChannel.id} username="You" />
            </footer>
          </>
        )}
      </main>
    </div>
  );
};

/* ---------- Root App: decides which screen to show ---------- */

const App: React.FC = () => {
  const token = useAuth((s) => s.token);

  if (!token) {
    return <AuthScreen />;
  }

  return <ChatLayout />;
};

export default App;
