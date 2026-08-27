"use client";

import { createContext, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import * as authService from "../../services/auth-service";
import { ApiError } from "../../services/auth-service";
import type { AuthUser, LoginInput, RegisterInput, SessionStatus } from "../../types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  status: SessionStatus;
  sessionError: string | null;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [sessionError, setSessionError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    setStatus("loading");
    setSessionError(null);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setStatus("authenticated");
    } catch (error) {
      setUser(null);
      if (error instanceof ApiError && error.status === 401) {
        setStatus("unauthenticated");
      } else {
        setSessionError(error instanceof Error ? error.message : "Unable to restore your session.");
        setStatus("error");
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    authService.getCurrentUser().then((currentUser) => {
      if (!active) return;
      setUser(currentUser);
      setStatus("authenticated");
    }).catch((error: unknown) => {
      if (!active) return;
      setUser(null);
      if (error instanceof ApiError && error.status === 401) {
        setStatus("unauthenticated");
      } else {
        setSessionError(error instanceof Error ? error.message : "Unable to restore your session.");
        setStatus("error");
      }
    });
    return () => { active = false; };
  }, []);

  async function login(input: LoginInput) {
    const authenticatedUser = await authService.login(input);
    setUser(authenticatedUser);
    setSessionError(null);
    setStatus("authenticated");
    return authenticatedUser;
  }

  async function register(input: RegisterInput) {
    const authenticatedUser = await authService.register(input);
    setUser(authenticatedUser);
    setSessionError(null);
    setStatus("authenticated");
    return authenticatedUser;
  }

  async function logout() {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setSessionError(null);
      setStatus("unauthenticated");
    }
  }

  const value = useMemo(
    () => ({ user, status, sessionError, login, register, logout, refreshSession }),
    [user, status, sessionError, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
