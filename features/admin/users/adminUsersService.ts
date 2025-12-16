import { apiClient } from "@/shared/api/apiClient";
import { PageResponse } from "@/shared/types/api";

// 목록 조회용 타입 (기존 OwnerResponse의 필드도 username일 가능성이 높음)
export interface OwnerResponse {
  ownerId: number;
  username: string; // ✅ name -> username (혹시 모를 불일치 방지)
  name?: string;    // 호환성 유지
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
  username: string; // ✅ name -> username 변경
  email: string;
  createdAt: string;
  
  stores: {
    storeId: number;
    storeName: string;
    industry: string;
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

export const getOwners = async (params: any) => {
  const response = await apiClient.get<PageResponse<OwnerResponse>>("/admin/users/owners", { params });
  return response.data;
};

export const getEmployees = async (params: any) => {
  const response = await apiClient.get<PageResponse<EmployeeResponse>>("/admin/users/employees", { params });
  return response.data;
};

export const getUserDetail = async (ownerId: number) => {
  const response = await apiClient.get<OwnerDetailResponse>(`/admin/users/owners/${ownerId}`);
  return response.data;
};