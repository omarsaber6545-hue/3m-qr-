import { create } from 'zustand';
import { api } from '@/utils/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  credits: number;
  subscriptionPlan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  subscriptionStatus: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  initialize: () => void;
  setUser: (user: User | null) => void;
  login: (credentials: any) => Promise<void>;
  signup: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  deductCredit: () => void;
  addCredits: (credits: number) => void;
  updateSubscription: (plan: string, status: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initialize: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      set({
        accessToken: token,
        user: JSON.parse(userStr),
        isAuthenticated: true,
      });
    }
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } else {
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', credentials);
      const { user, tokens } = res.data;
      
      localStorage.setItem('access_token', tokens.accessToken);
      localStorage.setItem('refresh_token', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        accessToken: tokens.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Login failed',
      });
      throw err;
    }
  },

  signup: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/signup', credentials);
      const { user, tokens } = res.data;
      
      localStorage.setItem('access_token', tokens.accessToken);
      localStorage.setItem('refresh_token', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        accessToken: tokens.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Registration failed',
      });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore logout endpoint errors
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      window.location.href = '/login';
    }
  },

  deductCredit: () => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, credits: Math.max(0, user.credits - 1) };
      get().setUser(updatedUser);
    }
  },

  addCredits: (credits) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, credits: user.credits + credits };
      get().setUser(updatedUser);
    }
  },

  updateSubscription: (plan: any, status: string) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, subscriptionPlan: plan, subscriptionStatus: status };
      get().setUser(updatedUser);
    }
  }
}));
