import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { logout as logoutRequest } from "@/api/auth";
import { UNAUTHORIZED_EVENT } from "@/api/client";
import { clearToken, getToken, setToken } from "@/api/session";
import { AuthContext, type AuthContextValue } from "./AuthContext";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const navigate = useNavigate();
  const location = useLocation();

  const login = useCallback((nextToken: string) => {
    setToken(nextToken);
    setTokenState(nextToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // 后端退出失败也要清掉本地登录态
    }
    clearToken();
    setTokenState(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    function handleUnauthorized() {
      clearToken();
      setTokenState(null);

      if (location.pathname === "/login") {
        return;
      }

      const redirect = `${location.pathname}${location.search}`;
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`, {
        replace: true,
      });
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () =>
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [location.pathname, location.search, navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isLoggedIn: Boolean(token),
      login,
      logout,
    }),
    [token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
