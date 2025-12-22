// modules/adminC/adminTypes.ts

import { StoreIndustry } from '../storeC/storeTypes';

export type UserTab = "ALL" | "OWNERS" | "EMPLOYEES";

// ✅ [추가] 로그 레벨 타입 정의
export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

// ✅ [추가] 로그 데이터 응답 타입 정의
export interface SystemLogResponse {
  logId: number;
  level: LogLevel;
  message: string;
  module: string;       // 예: "AUTH", "STORE"
  serverIp?: string;
  requesterId?: string; // 요청자 ID (없을 수 있음)
  createdAt: string;
}

// 목록 조회용 타입
export interface OwnerResponse {
  ownerId: number;
  username: string;
  name?: string;
  email: string;
  phone?: string;
  status?: string;
  createdAt: string;
}

export interface EmployeeResponse {
  employeeId: number;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

// 상세 조회용 타입
export interface OwnerDetailResponse {
  ownerId: number;
  username: string;
  email: string;
  createdAt: string;
  
  stores: {
    storeId: number;
    storeName: string;
    industry: StoreIndustry;
    status: string;
    active: boolean;
  }[];
  
  subscription: {
    subName: string;
    monthlyPrice: number;
    startDate: string;
    expiryDate: string;
    isActive: boolean;
  } | null;
}