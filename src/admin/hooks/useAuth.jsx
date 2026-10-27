import { createContext, useContext, useEffect, useState } from "react";
import { getStoredSession, loginWithPassword, logoutAdmin, refreshAdminSession } from "../lib/authClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function init() {
      const stored = getStoredSession();
      if (!stored) {
        setLoading(false);
        return;
      }

      // Check if token needs refresh
      if (stored.expires_at && stored.expires_at - Date.now() < 300_000) {
        const refreshed = await refreshAdminSession();
        setSession(refreshed);
      } else {
        setSession(stored);
      }
      setLoading(false);
    }
    init();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const newSession = await loginWithPassword(email, password);
      setSession(newSession);
      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
      throw err;
    }
  };

  const logout = async () => {
    await logoutAdmin();
    setSession(null);
  };

  const value = {
    session,
    user: session?.user || null,
    admin: session?.admin || null,
    role: session?.admin?.role || null,
    isAdmin: session?.admin?.role === "admin",
    isEditor: session?.admin?.role === "editor" || session?.admin?.role === "admin",
    isAuthenticated: Boolean(session?.access_token),
    loading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
