"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

export interface SessionUser {
  name: string;
}

export interface Session {
  user: SessionUser | null;
  login: (user: SessionUser | null) => void; // null = invitado
  logout: () => void;
}

const SessionContext = createContext<Session | null>(null);

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notify() {
  listeners.forEach((callback) => callback());
}

function getSnapshot(): SessionUser | null {
  try {
    return JSON.parse(localStorage.getItem("av_user") || "null");
  } catch {
    return null;
  }
}

function getServerSnapshot(): SessionUser | null {
  return null;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const login = (nextUser: SessionUser | null) => {
    localStorage.setItem("av_user", JSON.stringify(nextUser));
    notify();
  };

  const logout = () => {
    localStorage.removeItem("av_user");
    notify();
  };

  return (
    <SessionContext.Provider value={{ user, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): Session {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}
