import { apiClient } from "../../../lib/api/client";
import type { PageResponse } from "../../../lib/types/api";

// 1. Owner DTO (OwnerResponse.java 참고)
export type AdminOwner = {
  ownerId: number;
  username: string;
  email: string;
  createdAt: string; // (LocalDateTime -> string)
};

// 2. Employee DTO (EmployeeResponse.java 참고)
export type AdminEmployee = {
  employeeId: number;
  name: string;
  email: string;
  phone: string;
  provider: string;
  createdAt: string; // (LocalDateTime -> string)
};

// 3. API 요청 파라미터 타입 (공용)
type AdminGetUsersParams = {
  page: number;
  size: number;
  q: string; // 검색어
};

/**
 * (Admin) 사장님 목록 조회 (페이징, 검색)
 * GET /admin/users/owners
 */
export const getOwners = async (params: AdminGetUsersParams) => {
  const res = await apiClient.get<PageResponse<AdminOwner>>(
    "/admin/users/owners",
    { params }
  );
  return res.data;
};

/**
 * (Admin) 직원 목록 조회 (페이징, 검색)
 * GET /admin/users/employees
 */
export const getEmployees = async (params: AdminGetUsersParams) => {
  const res = await apiClient.get<PageResponse<AdminEmployee>>(
    "/admin/users/employees",
    { params }
  );
  return res.data;
};

/**
 * (Admin) 사장님 계정 삭제
 * DELETE /admin/users/owners/{id}
 */
export const deleteOwner = async (ownerId: number) => {
  const res = await apiClient.delete(`/admin/users/owners/${ownerId}`);
  return res.data;
};

/**
 * (Admin) 직원 계정 삭제
 * DELETE /admin/users/employees/{id}
 */
export const deleteEmployee = async (employeeId: number) => {
  const res = await apiClient.delete(`/admin/users/employees/${employeeId}`);
  return res.data;
};