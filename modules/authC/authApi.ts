// src/modules/auth/authApi.ts
import { apiClient } from "@/shared/api/apiClient";
import type { LoginRequest, LoginResponse, SignUpRequest, SignUpResponse } from "./authTypes";

export const authApi = {
  /**
   * (사장) 로그인
   * Path: /api/auth/login/owner
   */
  loginOwner: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>("/api/auth/login/owner", {
      email: data.email,
      password: data.password,
    });
    return res.data;
  },

  /**
   * (관리자) 로그인
   * Path: /api/auth/login/admin
   */
  loginAdmin: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>("/api/auth/login/admin", {
      username: data.username,
      password: data.password,
    });
    return res.data;
  },

  /**
   * (사장) 회원가입 (Owner + BusinessNumber + Store Transaction)
   */
  signUp: async (data: SignUpRequest): Promise<SignUpResponse> => {
    const res = await apiClient.post<SignUpResponse>("/api/auth/register/owner", data);
    return res.data;
  },

  /**
   * 비밀번호 재설정 요청
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    // 실제 API 연동
    await apiClient.post("/api/auth/reset-password", { email });
  },

  /**
   * (직원) 소셜 로그인 리다이렉트
   * OAuth2 Authorization Code Flow 시작
   */
  handleSocialLogin: (provider: "google" | "kakao" | "naver") => {
    if (typeof window !== "undefined") {
      // 백엔드 Spring Security OAuth2 엔드포인트 기준
      window.location.href = `/api/oauth2/authorization/${provider}`;
    }
  },
};