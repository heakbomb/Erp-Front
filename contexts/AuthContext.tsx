"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

type User = any;
type Role = "OWNER" | "EMPLOYEE" | "ADMIN" | string;

interface AuthContextType {
  user: User | null;
  role: Role | null;

  ownerId: number | null;
  employeeId: number | null;
  adminId: number | null;

  isLoggedIn: boolean;
  isLoading: boolean;

  login: (user: User, token: string) => void;

  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const USER_KEY = "user";

const toUpperRole = (r: any): string => String(r ?? "OWNER").toUpperCase();

const toNumberOrNull = (v: any): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

function normalizeUser(userData: any) {
  if (!userData) return userData;

  const role = toUpperRole(userData.role);

  if (role === "OWNER") {
    const ownerId = toNumberOrNull(userData.ownerId ?? userData.owner_id ?? userData.id);
    return { ...userData, ownerId, role };
  }

  if (role === "EMPLOYEE") {
    const employeeId = toNumberOrNull(userData.employeeId ?? userData.employee_id ?? userData.id);
    return { ...userData, employeeId, role };
  }

  if (role === "ADMIN") {
    const adminId = toNumberOrNull(userData.adminId ?? userData.admin_id ?? userData.id);
    return { ...userData, adminId, role };
  }

  return { ...userData, role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getAccessToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_KEY);
  };

  const getRefreshToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_KEY);
  };

  const clearStorage = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem(ACCESS_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(normalizeUser(parsed));
      } catch {
        clearStorage();
      }
    }

    setIsLoading(false);
  }, []);

  const login = (userData: User, accessToken: string) => {
    const normalizedUser = normalizeUser(userData);

    setUser(normalizedUser);

    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_KEY, accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));

      if (normalizedUser?.refreshToken) {
        localStorage.setItem(REFRESH_KEY, String(normalizedUser.refreshToken));
      }
    }
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    return getAccessToken();
  };

  const logout = async () => {
    const currentUser = user;
    const role = toUpperRole(currentUser?.role);
    const provider = String(currentUser?.provider ?? "").toLowerCase();
    const refreshToken = getRefreshToken();

    try {
      if (role === "OWNER") {
        const { authApi } = await import("@/modules/authC/authApi");
        await authApi.logout(refreshToken ?? undefined);
      }
    } catch {
      // ignore
    } finally {
      setUser(null);
      clearStorage();

      if (typeof window !== "undefined" && role === "EMPLOYEE" && provider === "kakao") {
        const kakaoClientId = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
        const logoutRedirectUri = `${window.location.origin}/login`;

        if (kakaoClientId) {
          const url =
            "https://kauth.kakao.com/oauth/logout" +
            `?client_id=${encodeURIComponent(kakaoClientId)}` +
            `&logout_redirect_uri=${encodeURIComponent(logoutRedirectUri)}`;

          window.location.replace(url);
          return;
        }
      }

      router.replace("/login");
    }
  };

  const derived = useMemo(() => {
    const role = (user?.role ?? null) as Role | null;
    const ownerId = toNumberOrNull(user?.ownerId);
    const employeeId = toNumberOrNull(user?.employeeId);
    const adminId = toNumberOrNull(user?.adminId);
    return { role, ownerId, employeeId, adminId };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: derived.role,
        ownerId: derived.ownerId,
        employeeId: derived.employeeId,
        adminId: derived.adminId,
        isLoggedIn: !!user,
        isLoading,
        login,
        getAccessToken,
        refreshAccessToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}