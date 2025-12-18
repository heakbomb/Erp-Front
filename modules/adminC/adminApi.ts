// modules/adminC/adminApi.ts
import { apiClient } from "@/shared/api/apiClient";
import type { PageResponse } from "@/shared/types/api"; // shared types 경로 확인 필요 (없으면 commonTypes 등 사용)
import type { 
  OwnerResponse, 
  EmployeeResponse, 
  OwnerDetailResponse 
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

// 기존 adminApi 객체 스타일 대신 features 처럼 개별 함수 export로 변경하거나,
// 호환성을 위해 객체로 묶어줄 수도 있지만, features와 구조를 맞추기 위해 개별 export를 권장합니다.
// 만약 기존 코드에서 adminApi.xxx 로 쓰고 있었다면 아래와 같이 묶어줄 수 있습니다.
export const adminApi = {
  getOwners,
  getEmployees,
  getUserDetail,
};