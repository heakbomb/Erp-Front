// src/modules/auth/authTypes.ts

import type { Owner } from "@/shared/types/database"; 

// 공통 로그인 요청
export interface LoginRequest {
  email?: string; // Owner ID (email)
  username?: string; // Admin ID
  password?: string;
}

// 로그인 응답 (JWT 포함)
export interface LoginResponse {
  token: string;
  user: Owner | any; // Admin 타입이 있다면 Union으로 추가
  role: "OWNER" | "ADMIN" | "EMPLOYEE";
}

// 사장님 회원가입 요청 (Owner + BusinessNumber + Store 초기 생성)
export interface SignUpRequest {
  username: string;       // Owner.username (실명)
  email: string;          // Owner.email (로그인 ID)
  password: string;       // Owner.password
  phone: string;          // BusinessNumber.phone (대표 연락처)
  businessNumber: string; // BusinessNumber.biz_num (사업자번호)
  storeName: string;      // Store.store_name (상호명)
}

export interface SignUpResponse {
  ownerId: number;
  message: string;
}