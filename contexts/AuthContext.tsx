"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

type User = any;

interface AuthContextType {
  user: User | null;
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

function normalizeUser(userData: any) {
  if (!userData) return userData;

  const role = userData.role ?? "OWNER";

  if (role === "OWNER") {
    const ownerId = userData.ownerId ?? userData.owner_id ?? userData.id ?? null;
    return { ...userData, ownerId, role };
  }

  if (role === "EMPLOYEE") {
    const employeeId = userData.employeeId ?? userData.employee_id ?? userData.id ?? null;
    return { ...userData, employeeId, role };
  }

  if (role === "ADMIN") {
    const adminId = userData.adminId ?? userData.admin_id ?? userData.id ?? null;
    return { ...userData, adminId, role };
  }

  return { ...userData, role };
}

function normalizeOwnerUser(userData: any) {
  return normalizeUser(userData);
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
    const normalizedUser = normalizeOwnerUser(userData);

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
    // ✅ user/provider/role은 스토리지 지우기 전에 잡아둬야 함
    const currentUser = user;
    const role = String(currentUser?.role ?? "").toUpperCase();
    const provider = String(currentUser?.provider ?? "").toLowerCase();

    const refreshToken = getRefreshToken();

    try {
      // ✅ 기존 사장 로그아웃 흐름 유지: OWNER만 서버 로그아웃 호출
      if (role === "OWNER") {
        const { authApi } = await import("@/modules/authC/authApi");
        await authApi.logout(refreshToken ?? undefined);
      }
    } catch {
      // ignore
    } finally {
      setUser(null);
      clearStorage();

      // ✅ 직원 + 카카오: 카카오 세션까지 끊어야 “자동로그인”이 사라짐
      if (typeof window !== "undefined" && role === "EMPLOYEE" && provider === "kakao") {
        const kakaoClientId = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
        const logoutRedirectUri = "http://localhost:3000/login"; // 카카오 콘솔에 등록한 값과 동일해야 함

        if (kakaoClientId) {
          const url =
            "https://kauth.kakao.com/oauth/logout" +
            `?client_id=${encodeURIComponent(kakaoClientId)}` +
            `&logout_redirect_uri=${encodeURIComponent(logoutRedirectUri)}`;

          window.location.replace(url);
          return;
        }
        // client id 없으면 fallback
      }

      router.replace("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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