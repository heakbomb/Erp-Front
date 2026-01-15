"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

type User = any;

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;

  // ✅ 기존 시그니처 유지 (팀 영향 최소화)
  login: (user: User, token: string) => void;

  // ✅ 추가: 토큰 접근/갱신/정리
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const USER_KEY = "user";

function normalizeOwnerUser(userData: any) {
  if (!userData) return userData;

  const ownerId = userData.ownerId ?? userData.owner_id ?? userData.id ?? null;
  const role = userData.role ?? "OWNER";

  return { ...userData, ownerId, role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // ✅ authApi는 여기서 직접 import 하지 않음(순환 의존 방지)
  // refresh는 apiClient가 담당하고, AuthContext는 localStorage만 다룸
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
        setUser(normalizeOwnerUser(parsed));
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

      // ✅ userData에 refreshToken이 있으면 같이 저장(없으면 무시)
      if (normalizedUser?.refreshToken) {
        localStorage.setItem(REFRESH_KEY, String(normalizedUser.refreshToken));
      }
    }
  };

  // ✅ apiClient 인터셉터에서 호출할 수 있도록 전역 함수 형태로도 접근 가능하게 유지(필요 시)
  const refreshAccessToken = async (): Promise<string | null> => {
    // 실제 refresh 로직은 apiClient에서 처리하므로
    // 여기서는 "스토리지에 새 accessToken이 써졌는지" 기준으로 반환만 지원
    // (팀 코드 영향 최소화)
    const token = getAccessToken();
    return token;
  };

  const logout = async () => {
    // 서버 로그아웃은 apiClient에서 401 처리/redirect와 충돌 날 수 있어
    // 여기서는 "스토리지 정리 + 라우팅"만 1차 보장
    const refreshToken = getRefreshToken();

    try {
      // ✅ 동적 import로 순환 의존 방지
      const { authApi } = await import("@/modules/authC/authApi");
      await authApi.logout(refreshToken ?? undefined);
    } catch {
      // 서버 호출 실패해도 클라이언트 로그아웃은 수행
    } finally {
      setUser(null);
      clearStorage();
      router.push("/login");
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