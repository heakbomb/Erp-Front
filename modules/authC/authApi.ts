// src/modules/auth/authApi.ts
import { apiClient } from "@/shared/api/apiClient";
import type { LoginRequest, LoginResponse, SignUpRequest, SignUpResponse } from "./authTypes";

export type SendEmailCodeRequest = { email: string };
export type SendEmailCodeResponse = { verificationId: string };

export type ConfirmEmailCodeRequest = { verificationId: string; code: string };
export type ConfirmEmailCodeResponse = { verified: boolean };

export type OwnerEmailExistsResponse = { exists: boolean };

// ✅ refreshToken 추가(백엔드가 아직 안 내려주면 undefined로 유지)
export type OwnerLoginResponse = {
  ownerId: number;
  email: string;
  username: string;
  accessToken: string;
  refreshToken?: string; // ✅ 추가
};

// ✅ refresh 요청/응답 타입(백엔드 스펙에 맞춰 키만 맞추면 됨)
export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken?: string; // rotation 설계면 내려올 수 있음
};

// ✅ 로그아웃 (서버 refreshToken 무효화 등)
export type LogoutResponse = { success?: boolean };

export const authApi = {
  loginOwner: async (data: LoginRequest): Promise<OwnerLoginResponse> => {
    const res = await apiClient.post<OwnerLoginResponse>("/auth/login/owner", {
      email: data.email,
      password: data.password,
    });
    return res.data;
  },

  loginAdmin: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>("/auth/login/admin", {
      username: data.username,
      password: data.password,
    });
    return res.data;
  },

  signUp: async (data: SignUpRequest): Promise<SignUpResponse> => {
    const res = await apiClient.post<SignUpResponse>("/auth/register/owner", data);
    return res.data;
  },

  checkOwnerEmailExists: async (email: string): Promise<OwnerEmailExistsResponse> => {
    const res = await apiClient.get<OwnerEmailExistsResponse>("/auth/register/owner/exists", {
      params: { email },
    });
    return res.data;
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    await apiClient.post("/auth/reset-password", { email });
  },

  handleSocialLogin: (provider: "google" | "kakao" | "naver") => {
    if (typeof window !== "undefined") {
      window.location.href = `/oauth2/authorization/${provider}`;
    }
  },

  sendEmailVerificationCode: async (data: SendEmailCodeRequest): Promise<SendEmailCodeResponse> => {
    const res = await apiClient.post<SendEmailCodeResponse>("/auth/email-verifications", data);
    return res.data;
  },

  resendEmailVerificationCode: async (verificationId: string): Promise<void> => {
    await apiClient.post(`/auth/email-verifications/${encodeURIComponent(verificationId)}/resend`);
  },

  confirmEmailVerificationCode: async (data: ConfirmEmailCodeRequest): Promise<ConfirmEmailCodeResponse> => {
    const res = await apiClient.post<ConfirmEmailCodeResponse>("/auth/email-verifications/confirm", data);
    return res.data;
  },

  // ✅ 추가: Refresh Token으로 AccessToken 재발급
  refreshAccessToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    // 백엔드가 쿠키 기반이면 body 없이 호출할 수도 있음.
    // 지금은 "refreshToken을 저장하는 구조" 가정 -> body로 전달.
    const res = await apiClient.post<RefreshTokenResponse>("/auth/token/refresh", { refreshToken });
    return res.data;
  },

  // ✅ 추가: 서버 로그아웃 (refreshToken 무효화)
  logout: async (refreshToken?: string): Promise<LogoutResponse> => {
    const res = await apiClient.post<LogoutResponse>("/auth/logout", { refreshToken });
    return res.data;
  },
};