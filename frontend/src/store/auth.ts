import { create } from "zustand";
import { api, setAuthToken } from "../lib/axios";

interface AuthState {
  token: string | null;
  user: { id: string; username: string; email: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: typeof localStorage !== "undefined" ? localStorage.getItem("token") : null,
  user: null,

  async login(email, password) {
    try {
      const { data } = await api.post("/auth/login", { email, password });

      // save token
      setAuthToken(data.accessToken);
      localStorage.setItem("token", data.accessToken);

      set({ token: data.accessToken });
      return true;
    } catch (err: any) {
      console.error("LOGIN ERROR →", err?.response?.status, err?.response?.data || err);
      return false;
    }
  },

  async register(email, username, password) {
    try {
      const { data } = await api.post("/auth/register", { email, username, password });
      console.log("REGISTER OK →", data);
      return true;
    } catch (err: any) {
      console.error("REGISTER ERROR →", err?.response?.status, err?.response?.data || err);
      return false;
    }
  },

  logout() {
    setAuthToken(null);
    localStorage.removeItem("token");
    set({ token: null, user: null });
  }
}));
