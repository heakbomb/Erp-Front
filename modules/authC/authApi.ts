// src/modules/auth/authApi.ts
import { apiClient } from "@/shared/api/apiClient";
import type { LoginRequest, LoginResponse, SignUpRequest, SignUpResponse } from "./authTypes";

export type SendEmailCodeRequest = { email: string };
export type SendEmailCodeResponse = { verificationId: string };

export type ConfirmEmailCodeRequest = { verificationId: string; code: string };
export type ConfirmEmailCodeResponse = { verified: boolean };

export type OwnerEmailExistsResponse = { exists: boolean };

export type OwnerLoginResponse = {
  ownerId: number;
  email: string;
  username: string;
  accessToken: string;
  refreshToken?: string;
};

export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken?: string;
};

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
    const res = await apiClient.get<OwnerEmailExistsResponse>(
      "/auth/register/owner/exists",
      { params: { email } }
    );
    return res.data;
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    await apiClient.post("/auth/reset-password", { email });
  },

  /**
   * ✅ 직원 소셜 로그인 진입
   * - 반드시 "백엔드 OAuth2 엔드포인트"로 직접 이동해야 함
   * - Next.js rewrite(/api → backend) 경로를 타게 구성
   */
  handleSocialLogin: (provider: "google" | "kakao" | "naver") => {
    if (typeof window === "undefined") return;

    // ❗ 현재 백엔드에 google/kakao만 구현되어 있으므로 방어
    if (provider === "naver") {
      alert("네이버 로그인은 아직 준비 중입니다.");
      return;
    }

    // ✅ OAuth2 시작점 (백엔드로 바로 진입)
    window.location.href = `/api/oauth2/authorization/${provider}`;
  },

  sendEmailVerificationCode: async (
    data: SendEmailCodeRequest
  ): Promise<SendEmailCodeResponse> => {
    const res = await apiClient.post<SendEmailCodeResponse>(
      "/auth/email-verifications",
      data
    );
    return res.data;
  },

  resendEmailVerificationCode: async (verificationId: string): Promise<void> => {
    await apiClient.post(
      `/auth/email-verifications/${encodeURIComponent(verificationId)}/resend`
    );
  },

  confirmEmailVerificationCode: async (
    data: ConfirmEmailCodeRequest
  ): Promise<ConfirmEmailCodeResponse> => {
    const res = await apiClient.post<ConfirmEmailCodeResponse>(
      "/auth/email-verifications/confirm",
      data
    );
    return res.data;
  },

  refreshAccessToken: async (
    refreshToken: string
  ): Promise<RefreshTokenResponse> => {
    const res = await apiClient.post<RefreshTokenResponse>(
      "/auth/token/refresh",
      { refreshToken }
    );
    return res.data;
  },

  logout: async (refreshToken?: string): Promise<LogoutResponse> => {
    const res = await apiClient.post<LogoutResponse>("/auth/logout", {
      refreshToken,
    });
    return res.data;
  },
};