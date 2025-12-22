// modules/adminC/adminTypes.ts

import { StoreIndustry } from '../storeC/storeTypes'; // ✅ Import 추가

export type UserTab = "ALL" | "OWNERS" | "EMPLOYEES";

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
    industry: StoreIndustry; // ✅ string -> StoreIndustry 변경
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