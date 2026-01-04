'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { pb } from '@/lib/pocketbase';
import { track } from '@vercel/analytics';
import {
  buildAuthorizationUrl,
  getRedirectUri,
  saveValyuTokens,
  loadValyuTokens,
  clearValyuTokens,
  type ValyuOAuthTokens,
} from '@/lib/valyu-oauth';

interface AuthState {
  user: any | null;
  loading: boolean;
  initialized: boolean;
  valyuAccessToken: string | null;
  valyuRefreshToken: string | null;
  valyuTokenExpiresAt: number | null;
  hasApiKey: boolean;
  creditsAvailable: boolean;
}

interface AuthActions {
  setUser: (user: any | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  signInWithValyu: () => Promise<{ data?: any; error?: any }>;
  completeValyuAuth: (
    idToken: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ) => Promise<{ success: boolean; error?: string }>;
  setValyuTokens: (accessToken: string, refreshToken: string, expiresIn: number) => void;
  getValyuAccessToken: () => string | null;
  setApiKeyStatus: (hasApiKey: boolean, creditsAvailable: boolean) => void;
  signOut: () => Promise<{ error?: any }>;
  initialize: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      initialized: false,
      valyuAccessToken: null,
      valyuRefreshToken: null,
      valyuTokenExpiresAt: null,
      hasApiKey: false,
      creditsAvailable: false,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),

      signInWithValyu: async () => {
        try {
          const redirectUri = getRedirectUri();
          const { url } = await buildAuthorizationUrl(redirectUri, window.location.host);
          window.location.href = url;
          return { data: { url } };
        } catch (error) {
          return { error };
        }
      },

      completeValyuAuth: async (idToken, accessToken, refreshToken, expiresIn) => {
        try {
          const tokens: ValyuOAuthTokens = {
            accessToken,
            refreshToken,
            expiresAt: Date.now() + (expiresIn * 1000),
            idToken,
          };
          saveValyuTokens(tokens);

          set({
            valyuAccessToken: accessToken,
            valyuRefreshToken: refreshToken,
            valyuTokenExpiresAt: tokens.expiresAt,
          });

          // Create/Refresh PocketBase session via Valyu tokens if needed
          // For now, we'll use a custom API to exchange Valyu token for PB session
          const sessionResponse = await fetch('/api/auth/valyu/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: accessToken, id_token: idToken }),
          });

          if (!sessionResponse.ok) throw new Error('Failed to create session');

          const sessionData = await sessionResponse.json();

          if (sessionData.token) {
            pb.authStore.save(sessionData.token, sessionData.model);
            set({ user: sessionData.model, loading: false });
            track('Sign In Success', { method: 'valyu' });
          }

          return { success: true };
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : 'Auth failed' };
        }
      },

      setValyuTokens: (accessToken, refreshToken, expiresIn) => {
        const expiresAt = Date.now() + (expiresIn * 1000);
        saveValyuTokens({ accessToken, refreshToken, expiresAt });
        set({ valyuAccessToken: accessToken, valyuRefreshToken: refreshToken, valyuTokenExpiresAt: expiresAt });
      },

      getValyuAccessToken: () => {
        const state = get();
        if (state.valyuAccessToken && state.valyuTokenExpiresAt && Date.now() < state.valyuTokenExpiresAt) {
          return state.valyuAccessToken;
        }
        const tokens = loadValyuTokens();
        if (tokens) {
          set({ valyuAccessToken: tokens.accessToken, valyuRefreshToken: tokens.refreshToken, valyuTokenExpiresAt: tokens.expiresAt });
          return tokens.accessToken;
        }
        return null;
      },

      setApiKeyStatus: (hasApiKey, creditsAvailable) => set({ hasApiKey, creditsAvailable }),

      signOut: async () => {
        try {
          pb.authStore.clear();
          clearValyuTokens();
          set({ user: null, valyuAccessToken: null, valyuRefreshToken: null, valyuTokenExpiresAt: null, hasApiKey: false, creditsAvailable: false });
          return {};
        } catch (error) {
          return { error };
        }
      },

      initialize: () => {
        if (get().initialized) return;
        set({ initialized: true });

        // Sync with pb.authStore
        if (pb.authStore.isValid) {
          set({ user: pb.authStore.model });
        }

        // Load Valyu tokens
        const valyuTokens = loadValyuTokens();
        if (valyuTokens) {
          set({ valyuAccessToken: valyuTokens.accessToken, valyuRefreshToken: valyuTokens.refreshToken, valyuTokenExpiresAt: valyuTokens.expiresAt });
        }

        set({ loading: false });

        // Listen for PB auth changes
        pb.authStore.onChange((token, model) => {
          set({ user: model });
          if (!token) {
            clearValyuTokens();
            set({ valyuAccessToken: null, valyuRefreshToken: null, valyuTokenExpiresAt: null });
          }
        });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user }),
      skipHydration: true,
    }
  )
);
