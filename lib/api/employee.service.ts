import { apiClient } from "./client";
import type { Employee, EmployeeAssignment } from "../types/database"; // ⬅️ 경로 수정

/**
 * (사장) 전체 직원 목록 조회 (admin 겸용)
 *
 */
export const getAllEmployees = async () => {
  const res = await apiClient.get<Employee[]>("/employees");
  return res.data;
};

type EmployeeUpdateBody = {
  name: string;
  email: string;
  phone: string;
  provider: string;
};

/**
 * (사장) 직원 정보 수정 (admin 겸용)
 *
 */
export const updateEmployee = async (
  employeeId: number,
  body: EmployeeUpdateBody
) => {
  const res = await apiClient.put<Employee>(`/employees/${employeeId}`, body);
  return res.data;
};

/**
 * (사장) 직원 삭제 (admin 겸용)
 *
 */
export const deleteEmployee = async (employeeId: number) => {
  await apiClient.delete(`/employees/${employeeId}`);
};

/**
 * (사장) 특정 사업장의 신청 대기 목록 조회
 *
 */
export const getPendingAssignments = async (storeId: number) => {
  const res = await apiClient.get<EmployeeAssignment[]>(
    "/assignments/pending",
    { params: { storeId } }
  );
  return res.data;
};

/**
 * (사장) 신청 승인
 *
 */
export const approveAssignment = async (assignmentId: number) => {
  await apiClient.post(`/assignments/${assignmentId}/approve`);
};

/**
 * (사장) 신청 거절
 *
 */
export const rejectAssignment = async (assignmentId: number) => {
  await apiClient.post(`/assignments/${assignmentId}/reject`);
};

/**
 * (직원) 사업장에 근무 신청
 *
 */
export const applyToStore = async (body: {
  employeeId: number;
  storeId: number;
  role: string;
}) => {
  const res = await apiClient.post<EmployeeAssignment>(
    "/assignments/apply",
    body
  );
  return res.data;
};