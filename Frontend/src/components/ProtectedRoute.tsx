// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const AUTH_TOKEN_KEYS = ["authToken", "token"] as const;

function getToken(): string {
  for (const k of AUTH_TOKEN_KEYS) {
    const v = localStorage.getItem(k);
    if (v && v.trim()) return v.trim();
  }
  return "";
}

export const clearAuth = () => {
  try {
    for (const k of AUTH_TOKEN_KEYS) localStorage.removeItem(k);
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
  } catch {
    // ignore
  }
};

/**
 * Best-effort JWT expiry check (prevents "expired token but still present" flicker).
 * If token isn't a JWT, we simply return false and rely on API 401 handler.
 */
function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // base64url -> base64
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
    const json = atob(b64 + pad);
    const payload = JSON.parse(json);

    const exp = Number(payload?.exp);
    if (!exp || Number.isNaN(exp)) return false;

    const nowSec = Math.floor(Date.now() / 1000);
    return exp <= nowSec;
  } catch {
    return false;
  }
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const [forcedOut, setForcedOut] = React.useState(false);

  React.useEffect(() => {
    const onLogout = () => {
      // ensure local storage cleared even if some code forgot
      clearAuth();
      setForcedOut(true);
    };
    window.addEventListener("auth:logout", onLogout as any);
    return () => window.removeEventListener("auth:logout", onLogout as any);
  }, []);

  const token = getToken();

  // If we already got a forced logout event, redirect immediately (no UI rendering).
  if (forcedOut) {
    return <Navigate to="/login" replace state={{ from: location, reason: "SESSION_EXPIRED" }} />;
  }

  // No token -> logout/redirect immediately
  if (!token) {
    clearAuth();
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Token exists but JWT exp is already past -> redirect BEFORE rendering children (kills flicker)
  if (isJwtExpired(token)) {
    clearAuth();
    return <Navigate to="/login" replace state={{ from: location, reason: "TOKEN_EXPIRED" }} />;
  }

  return <>{children}</>;
};
