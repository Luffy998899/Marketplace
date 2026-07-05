'use client';

import { create } from 'zustand';
import { UserRole } from '@acm/shared';
import { authApi, commissionsApi, setToken, getToken, studioApi } from '@/lib/api';

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
  becomeCreator: () => Promise<void>;
  becomeFreelancer: () => Promise<void>;
  logout: () => void;
  isCreator: () => boolean;
  isFreelancer: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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

  becomeCreator: async () => {
    const user = await studioApi.becomeCreator();
    set({ user });
  },

  becomeFreelancer: async () => {
    const user = await commissionsApi.becomeFreelancer();
    set({ user });
  },

  logout: () => {
    setToken(null);
    set({ user: null });
  },

  isCreator: () => {
    const role = get().user?.role;
    return role === UserRole.CREATOR || role === UserRole.ADMIN;
  },

  isFreelancer: () => {
    const role = get().user?.role;
    return role === UserRole.FREELANCER || role === UserRole.ADMIN;
  },
}));
