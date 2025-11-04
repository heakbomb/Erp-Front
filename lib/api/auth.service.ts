import { apiClient } from "./client";
import type { Owner } from "../types/database"; // ⬅️ 경로 수정

// TODO: 백엔드 응답 DTO에 맞춰 수정 (예: { user: Owner, token: string })
type LoginResponse = {
  token: string;
  user: Owner;
};

/**
 * (사장) 이메일/비밀번호 로그인
 *
 */
export const loginOwner = async (body: {
  ownerEmail: string;
  ownerPassword: string;
}) => {
  // TODO: 엔드포인트 확정 필요 (예: /api/auth/login/owner)
  const res = await apiClient.post<LoginResponse>("/api/auth/login/owner", body);
  return res.data;
};

type RegisterOwnerBody = {
  name: string;
  email: string;
  password: string;
  phone: string;
  businessName: string;
  businessNumber: string;
};

/**
 * (사장) 회원가입
 *
 */
export const registerOwner = async (body: RegisterOwnerBody) => {
  // TODO: 엔드포인트 확정 필요 (예: /api/auth/register/owner)
  const res = await apiClient.post<Owner>("/api/auth/register/owner", body);
  return res.data;
};

/**
 * (직원) 소셜 로그인 (OAuth 리다이렉트 처리)
 *
 */
export const handleSocialLogin = (provider: "google" | "kakao" | "naver") => {
  // OAuth2.0 리다이렉트 URL로 이동
  // (BASE_URL이 /api로 설정되었으므로 /api/oauth2/authorization/google)
  if (typeof window !== "undefined") {
    window.location.href = `/api/oauth2/authorization/${provider}`;
  }
};