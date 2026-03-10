// src/modules/auth/useLogin.ts
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/ui/use-toast";
import { authApi, OwnerLoginResponse } from "./authApi"; // OwnerLoginResponse 타입 추가
import { useAuth } from "@/contexts/AuthContext";

function pickErrorMessage(e: any) {
  return (
    e?.friendlyMessage ||
    e?.response?.data?.message ||
    (typeof e?.response?.data === "string" ? e.response.data : "") ||
    "아이디 또는 비밀번호를 확인해주세요."
  );
}

export function useLogin() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [storeCode, setStoreCode] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleError = (error: any, title: string) => {
    const msg = pickErrorMessage(error);
    if (typeof window !== "undefined") alert(msg);
    toast({ variant: "destructive", title, description: msg });
    if (error?.fieldErrors) setFieldErrors(error.fieldErrors);
  };

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});

    try {
      const res = await authApi.loginOwner({ email: ownerEmail, password: ownerPassword });

      login(
        {
          ownerId: res.ownerId,
          email: res.email,
          username: res.username,
          role: "OWNER",
          refreshToken: res.refreshToken,
        },
        res.accessToken
      );

      toast({ title: "로그인 성공", description: "사장님 대시보드로 이동합니다." });
      router.push("/owner/dashboard");
    } catch (error: any) {
      handleError(error, "로그인 실패");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ [수정됨] 관리자 로그인 핸들러
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});

    try {
      // 1. authApi 호출
      const res: OwnerLoginResponse = await authApi.loginAdmin({ 
        username: adminUsername, 
        password: adminPassword 
      });

      // 2. 로그인 처리 (res 자체가 유저 정보 + 토큰)
      login(
        {
          ownerId: res.ownerId, // 관리자 ID
          email: res.email,     // "admin"
          username: res.username, // "admin"
          role: "ADMIN",        // 역할 강제 지정
          refreshToken: res.refreshToken,
        },
        res.accessToken
      );

      toast({ title: "관리자 접속", description: "관리자 페이지로 이동합니다." });
      router.push("/admin/dashboard");
    } catch (error: any) {
      handleError(error, "로그인 실패");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "kakao" | "naver") => {
    authApi.handleSocialLogin(provider);
  };

  const handleEnterKiosk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeCode) {
      const msg = "사업장 코드를 입력해주세요.";
      if (typeof window !== "undefined") alert(msg);
      toast({ variant: "destructive", title: "입력 오류", description: msg });
      return;
    }
    router.push(`/attendance/desktop?storeCode=${storeCode}`);
  };

  return {
    ownerEmail, setOwnerEmail,
    ownerPassword, setOwnerPassword,
    adminUsername, setAdminUsername,
    adminPassword, setAdminPassword,
    storeCode, setStoreCode,
    isLoading,
    fieldErrors,
    handleOwnerLogin,
    handleSocialLogin,
    handleAdminLogin,
    handleEnterKiosk,
  };
}