// modules/adminC/adminApi.ts
import { apiClient } from "@/shared/api/apiClient";
import type { PageResponse } from "@/shared/types/api";
import type { 
  OwnerResponse, 
  EmployeeResponse, 
  OwnerDetailResponse,
  SystemLogResponse // ✅ 추가된 타입 import
} from "./adminTypes";

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

// ✅ [추가] 로그 목록 조회 API
export const getLogs = async (params: any) => {
  // 백엔드 API 경로가 /admin/logs 라고 가정
  const response = await apiClient.get<PageResponse<SystemLogResponse>>("/admin/logs", { params });
  return response.data;
};

export const adminApi = {
  getOwners,
  getEmployees,
  getUserDetail,
  getLogs, // ✅ export 객체에 추가
};