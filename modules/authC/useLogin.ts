// src/modules/auth/useLogin.ts
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/ui/use-toast";
import { authApi } from "./authApi";
import { useAuth } from "@/contexts/AuthContext";

export function useLogin() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth(); // AuthContext에서 login 함수 가져오기

  // 입력 상태
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  
  // 키오스크(QR) 진입용 사업장 코드
  const [storeCode, setStoreCode] = useState("");

  // UI 상태
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 1. 사장님 로그인
  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});

    try {
      const response = await authApi.loginOwner({ email: ownerEmail, password: ownerPassword });
      
      // [수정] Context의 login 함수에 유저 정보와 토큰을 함께 전달
      login(response.user, response.token); 
      
      toast({ title: "로그인 성공", description: "사장님 대시보드로 이동합니다." });
      router.push("/owner/dashboard");
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 관리자 로그인
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});

    try {
      const response = await authApi.loginAdmin({ username: adminUsername, password: adminPassword });
      
      // [수정] 관리자 정보와 토큰 전달 (role 추가 등은 로직에 따라 조정)
      login({ ...response.user, role: "ADMIN" }, response.token); 
      
      toast({ title: "관리자 접속", description: "관리자 페이지로 이동합니다." });
      router.push("/admin/dashboard");
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 소셜 로그인 (직원)
  const handleSocialLogin = (provider: "google" | "kakao" | "naver") => {
    authApi.handleSocialLogin(provider);
  };

  // 4. 키오스크 모드 진입 (QR 탭)
  const handleEnterKiosk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeCode) {
      toast({ variant: "destructive", title: "입력 오류", description: "사업장 코드를 입력해주세요." });
      return;
    }
    router.push(`/attendance/desktop?storeCode=${storeCode}`);
  };

  // 공통 에러 처리
  const handleError = (error: any) => {
    if (error.fieldErrors) {
      setFieldErrors(error.fieldErrors);
    }
    toast({
      variant: "destructive",
      title: "로그인 실패",
      description: error.response?.data?.message || "아이디 또는 비밀번호를 확인해주세요.",
    });
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