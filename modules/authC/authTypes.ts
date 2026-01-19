// src/modules/auth/authTypes.ts
import type { Owner } from "@/shared/types/database";

// 공통 로그인 요청
export interface LoginRequest {
  email?: string;
  username?: string;
  password?: string;
}

// ✅ 백엔드 OwnerLoginResponse 형태
export interface LoginResponse {
  ownerId: number;
  email: string;
  username: string;
  accessToken: string;
}

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  verificationId: string;
}

export interface SignUpResponse {
  ownerId: number;
}