'use client';

import { create } from 'zustand';
import { authApi, setToken, getToken } from '@/lib/api';

interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  hydrate: async () => {
    if (!getToken()) {
      set({ user: null, loading: false });
      return;
    }
    try {
      const user = await authApi.me();
      set({ user, loading: false });
    } catch {
      setToken(null);
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const res = await authApi.login({ email, password });
    setToken(res.accessToken);
    set({ user: res.user });
  },

  register: async (email, password, displayName) => {
    const res = await authApi.register({ email, password, displayName });
    setToken(res.accessToken);
    set({ user: res.user });
  },

  googleLogin: async () => {
    const res = await authApi.google({
      email: `google_${Date.now()}@synthetica.dev`,
      displayName: 'Google User',
      googleId: `gid_${Date.now()}`,
    });
    setToken(res.accessToken);
    set({ user: res.user });
  },

  logout: () => {
    setToken(null);
    set({ user: null });
  },
}));
