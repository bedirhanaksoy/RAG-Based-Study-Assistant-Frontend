import { create } from "zustand";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  checkAuthRequired: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: true,
  loading: false,

  login: async () => {
    set({ isAuthenticated: true });
    return true;
  },

  logout: () => {
    set({ isAuthenticated: true });
  },

  checkAuthRequired: async () => {
    set({ isAuthenticated: true });
  },
}));
