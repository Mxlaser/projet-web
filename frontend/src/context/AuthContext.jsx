import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

function sanitizeToken(raw) {
  if (!raw) return null;
  const t = String(raw).trim();
  if (t === "" || t === "undefined" || t === "null") return null;
  return t;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sanitizeToken(localStorage.getItem("token")));
  const isAuthenticated = !!token;

  useEffect(() => {
    const clean = sanitizeToken(token);

    if (clean) localStorage.setItem("token", clean);
    else localStorage.removeItem("token");

    if (clean !== token) setToken(clean);
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      isAuthenticated,
      setToken: (t) => setToken(sanitizeToken(t)),
      setAuthToken: (t) => setToken(sanitizeToken(t)), 
      logout: () => setToken(null),
    }),
    [token, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
