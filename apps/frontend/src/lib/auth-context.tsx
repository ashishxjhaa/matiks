"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  clearToken,
  fetchMe,
  getToken,
  login as apiLogin,
  register as apiRegister,
  setToken,
} from "./api";
import type { AuthUser } from "./types";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Identical first paint on server + client (no localStorage during render).
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      const existing = getToken();
      if (!existing) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const res = await fetchMe();
        if (cancelled) return;
        setTokenState(existing);
        setUser(res.data.user);
      } catch {
        if (cancelled) return;
        clearToken();
        setTokenState(null);
        setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void boot();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setToken(res.data.token);
    setLoading(true);
    setTokenState(res.data.token);
    const me = await fetchMe();
    setUser(me.data.user);
    setLoading(false);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    await apiRegister(email, password);
    const res = await apiLogin(email, password);
    setToken(res.data.token);
    setLoading(true);
    setTokenState(res.data.token);
    const me = await fetchMe();
    setUser(me.data.user);
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
