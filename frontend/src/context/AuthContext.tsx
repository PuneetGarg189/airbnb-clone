"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@/types";
import * as api from "@/lib/api";

interface AuthContextType {
  /** null when signed out */
  user: User | null;
  isLoggedIn: boolean;
  isHost: boolean;
  /** true until we know whether a saved token is still valid */
  loading: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  becomeHost: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isHost: false,
  loading: true,
  login: async () => { throw new Error("AuthProvider missing"); },
  register: async () => { throw new Error("AuthProvider missing"); },
  logout: () => {},
  becomeHost: async () => { throw new Error("AuthProvider missing"); },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from the saved token (the server is the source of truth).
  useEffect(() => {
    let alive = true;
    (async () => {
      if (api.tokens.access) {
        try {
          const me = await api.fetchMe();
          if (alive) setUser(me);
        } catch {
          api.tokens.clear();
        }
      }
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const me = await api.login(identifier, password);
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const me = await api.register(name, email, password);
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    api.tokens.clear();
    setUser(null);
  }, []);

  const becomeHost = useCallback(async () => {
    const me = await api.becomeHost();
    setUser(me);
    return me;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, isHost: !!user?.is_host, loading, login, register, logout, becomeHost }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
