import { create } from "zustand";
import { setAuthToken } from "../lib/api";

type User = { id: number; name: string; email: string };
type AuthState = {
  token: string | null;
  user: User | null;
  login: (data: { token: string; user: User }) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  login: ({ token, user }) => {
    setAuthToken(token);
    set({ token, user });
    localStorage.setItem("eduplan_auth", JSON.stringify({ token, user }));
  },
  logout: () => {
    setAuthToken(undefined);
    set({ token: null, user: null });
    localStorage.removeItem("eduplan_auth");
  }
}));

// Mantener sesión entre recargas
const saved = localStorage.getItem("eduplan_auth");
if (saved) {
  const parsed = JSON.parse(saved);
  setAuthToken(parsed.token);
  useAuthStore.setState({ token: parsed.token, user: parsed.user });
}
