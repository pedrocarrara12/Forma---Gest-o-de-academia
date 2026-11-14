import React, { createContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { request } from "../api";
export const Auth = createContext(null);
export function AuthProvider({ children }) {
  const client = useQueryClient();
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(null),
    [pending, setPending] = useState(false);
  const expire = () => {
    setUser(null);
    client.clear();
  };
  const check = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await request("/api/auth/session");
      setUser(data.user);
    } catch (e) {
      if (e.status !== 401) setError(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    check();
    window.addEventListener("forma:unauthorized", expire);
    return () => window.removeEventListener("forma:unauthorized", expire);
  }, []);
  const login = async (email, password) => {
    setPending(true);
    try {
      const data = await request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      client.clear();
      setUser(data.user);
    } finally {
      setPending(false);
    }
  };
  const logout = async () => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      await request("/api/auth/logout", { method: "POST", body: "{}" });
      expire();
    } catch (e) {
      setError(e);
    } finally {
      setPending(false);
    }
  };
  if (loading)
    return (
      <p className="session-status" role="status">
        Verificando sessão…
      </p>
    );
  if (error && !user)
    return (
      <div className="session-status">
        <p role="alert">{error.message}</p>
        <button onClick={check}>Tentar novamente</button>
      </div>
    );
  return (
    <Auth.Provider value={{ user, login, logout, pending, error }}>
      {children}
    </Auth.Provider>
  );
}
