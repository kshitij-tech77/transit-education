'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { ContestUser, ContestAuthState } from '@/types/contest';

interface ContestContextValue extends ContestAuthState {
  showAuthModal: boolean;
  authModalOpen: () => void;
  authModalClose: () => void;
  setUser: (user: ContestUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const ContestContext = createContext<ContestContextValue | null>(null);

export function ContestProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<ContestUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/contest/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUserState(data.user);
      } else {
        setUserState(null);
        setToken(null);
      }
    } catch {
      setUserState(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const setUser = useCallback((u: ContestUser) => {
    setUserState(u);
  }, []);

  const logout = useCallback(() => {
    setUserState(null);
    setToken(null);
    // Clear cookie by calling a logout endpoint (or set expired cookie client-side won't work for httpOnly)
    fetch('/api/contest/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
  }, []);

  return (
    <ContestContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        showAuthModal,
        authModalOpen: () => setShowAuthModal(true),
        authModalClose: () => setShowAuthModal(false),
        setUser,
        logout,
        refreshUser,
      }}
    >
      {children}
    </ContestContext.Provider>
  );
}

export function useContest() {
  const ctx = useContext(ContestContext);
  if (!ctx) throw new Error('useContest must be used within ContestProvider');
  return ctx;
}
