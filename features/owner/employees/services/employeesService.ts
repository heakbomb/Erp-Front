// features/owner/employees/services/employeesService.ts
import { apiClient } from "@/lib/api/client";
import { extractErrorMessage as utilExtractErrorMessage } from "@/lib/utils";
import type { Employee } from "@/lib/types/database";

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
  const res = await apiClient.get<Employee[]>(`/employees`);
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
  await apiClient.put(`/employees/${employeeId}`, body);
}

export async function deleteEmployee(employeeId: number) {
  await apiClient.delete(`/employees/${employeeId}`);
}

/* ───────── Pending(신청/승인/거절) ───────── */
export async function fetchPendingAssignments(
  storeId: number,
): Promise<PendingRequest[]> {
  const res = await apiClient.get<PendingRequest[]>(`/assignments/pending`, {
    params: { storeId },
  });
  return res.data || [];
}

export async function approveAssignment(assignmentId: number) {
  await apiClient.post(`/assignments/${assignmentId}/approve`);
}

export async function rejectAssignment(assignmentId: number) {
  await apiClient.post(`/assignments/${assignmentId}/reject`);
}

/* ───────── QR(사업장) ───────── */
export async function fetchStoreQr(storeId: number, refresh = false) {
  const res = await apiClient.get(`/store/${storeId}/qr`, {
    params: { refresh },
  });
  return res.data;
}

/* ───────── 출결 현황(사장용 월간 요약) ───────── */

export type EmployeeAttendanceSummary = {
  employeeId: number;
  employeeName: string;

  storeId: number;
  storeName: string;

  // 이번 달 기준
  workDaysThisMonth: number;    // 총 근무일수
  workHoursThisMonth: number;   // 총 근무시간 (시간 단위)
};

/**
 * 사장페이지 - 직원 출결 월간 요약 조회
 * GET /attendance/owner/summary?storeId=11&month=2025-11
 */
export async function fetchEmployeesAttendanceSummary(params: {
  storeId: number;
  month: string; // "YYYY-MM"
}): Promise<EmployeeAttendanceSummary[]> {
  const res = await apiClient.get<EmployeeAttendanceSummary[]>(
    "/attendance/owner/summary",
    { params }, // 👈 반드시 month 키로 보낸다
  );
  return res.data || [];
}

/* ───────── 출퇴근 로그 리스트(사장용) ───────── */

export type OwnerAttendanceLogItem = {
  logId: number;
  recordTime: string; // ISO datetime
  recordType: "IN" | "OUT";
  employeeId: number;
  storeId: number;
  employeeName?: string | null;
};

/**
 * 사장페이지 - 특정 사업장 / 날짜 기준 전체 출퇴근 로그 조회
 * GET /attendance/owner/logs?storeId=11&from=2025-11-05&to=2025-11-05
 */
export async function fetchOwnerAttendanceLogs(params: {
  storeId: number;
  date: string; // "YYYY-MM-DD"
}): Promise<OwnerAttendanceLogItem[]> {
  const res = await apiClient.get<OwnerAttendanceLogItem[]>(
    "/attendance/owner/logs",
    {
      params: {
        storeId: params.storeId,
        from: params.date,
        to: params.date,
      },
    },
  );
  return res.data || [];
}

/* ───────── 공용 에러 메시지 ───────── */
export function extractErrorMessage(e: any): string {
  return utilExtractErrorMessage(e);
}