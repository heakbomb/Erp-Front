// src/modules/auth/useLogin.ts
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/ui/use-toast";
import { authApi } from "./authApi";
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

  // ✅ 추가: 공통 에러 처리 (여기만 추가하면 handleError 에러 해결)
  const handleError = (error: any, title: string) => {
    const msg = pickErrorMessage(error);

    // 사용자 알림(요구사항: 브라우저 콘솔에만 찍히고 끝나면 안 됨)
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

      // ✅ 백엔드 OwnerLoginResponse 기준 매핑
      // res: { ownerId, email, username, accessToken }
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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});

    try {
      const res: any = await authApi.loginAdmin({ username: adminUsername, password: adminPassword });

      // ⚠️ admin 응답 DTO에 맞춰 아래를 조정해야 함
      const user = { ...(res.user ?? res), role: "ADMIN" };
      const token = res.accessToken ?? res.token;

      login(user, token);

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