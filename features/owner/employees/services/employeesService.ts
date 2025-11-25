// features/owner/employees/services/employeesService.ts
import { apiClient } from "@/lib/api/client"; // ✅ apiClient 사용
import { extractErrorMessage as utilExtractErrorMessage } from "@/lib/utils"; // ✅ lib/utils에서 가져오기
import type { Employee } from "@/lib/types/database"; // ✅ 공용 Employee 타입 사용

/** 직원-사업장 배정 신청 응답(대기/승인/거절 공통) */
export type PendingRequest = {
  assignmentId: number;
  employeeId: number;
  storeId: number;
  role?: string;
  status?: string;
  name?: string;
  email?: string;
  phone?: string;
  requestedAt?: string;
};

export async function fetchEmployees(): Promise<Employee[]> {
  const res = await apiClient.get<Employee[]>(`/employees`); // ✅ apiClient 사용
  return res.data || [];
}

export async function updateEmployee(payload: {
  employeeId: number;
  name: string;
  email: string;
  phone: string;
  provider: string;
}) {
  const { employeeId, ...body } = payload;
  await apiClient.put(`/employees/${employeeId}`, body); // ✅ apiClient 사용
}

export async function deleteEmployee(employeeId: number) {
  await apiClient.delete(`/employees/${employeeId}`); // ✅ apiClient 사용
}

/* ───────── Pending(신청/승인/거절) ───────── */
export async function fetchPendingAssignments(storeId: number): Promise<PendingRequest[]> {
  // ✅ 백엔드 컨트롤러: @RequestMapping("/assignments")
  const res = await apiClient.get<PendingRequest[]>(`/assignments/pending`, {
    params: { storeId },
  });
  return res.data || [];
}

export async function approveAssignment(assignmentId: number) {
  // ✅ POST /assignments/{assignmentId}/approve
  await apiClient.post(`/assignments/${assignmentId}/approve`);
}

export async function rejectAssignment(assignmentId: number) {
  // ✅ POST /assignments/{assignmentId}/reject
  await apiClient.post(`/assignments/${assignmentId}/reject`);
}

/* ───────── QR(사업장) ───────── */
export async function fetchStoreQr(storeId: number, refresh = false) {
  // (QR 엔드포인트는 기존 페이지와 호환 유지)
  const res = await apiClient.get(`/store/${storeId}/qr`, {
    params: { refresh },
  });
  return res.data;
}

/* ───────── 공용 에러 메시지 ───────── */
export function extractErrorMessage(e: any): string {
  // ✅ lib/utils의 공용 함수 사용
  return utilExtractErrorMessage(e);
}