import { apiClient } from "@/lib/api/client";

// 직원 프로필 타입
export interface EmployeeProfile {
  employeeId: number;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

// 직원 소속 사업장 타입
export interface EmployeeStore {
  storeId: number;
  storeName: string;
  industry: string;
  // 필요 시 추가 필드 정의
}

// 직원 상세 정보 조회
export const getEmployeeProfile = async (id: number) => {
  const response = await apiClient.get<EmployeeProfile>(`/employees/${id}`);
  return response.data;
};

// ✅ [추가] 직원의 소속 사업장 목록 조회
export const getEmployeeStores = async (id: number) => {
  // ⚠️ 백엔드에 GET /employees/{id}/stores 엔드포인트 구현 필요
  const response = await apiClient.get<EmployeeStore[]>(`/employees/${id}/stores`);
  return response.data;
};

export const updateEmployeePhone = async (id: number, phone: string) => {
  await apiClient.patch(`/employees/${id}`, { phone });
};