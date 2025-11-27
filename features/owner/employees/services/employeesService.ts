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

/* ───────── 출결 현황(사장용 요약 카드) ───────── */

/**
 * 한 사업장에 등록된 직원들의 출결 요약
 *
 * todayStatus:
 *  - "IN"      : 현재 근무 중(출근 완료, 아직 퇴근 X)
 *  - "OUT"     : 오늘 출근/퇴근 모두 완료
 *  - "ABSENT"  : 오늘 아직 출근 기록 없음
 *  - "UNKNOWN" : 기타/확인 필요
 */
export type EmployeeAttendanceSummary = {
  employeeId: number;
  name: string;
  email?: string | null;
  phone?: string | null;

  todayStatus: "IN" | "OUT" | "ABSENT" | "UNKNOWN";
  todayFirstIn?: string | null;
  todayLastOut?: string | null;

  totalHoursThisMonth?: number | null;
  lateCountThisMonth?: number | null;
};

/**
 * 사장페이지 - 직원 출결 현황 요약 조회
 * GET /owner/attendance/summary
 */
export async function fetchEmployeesAttendanceSummary(params: {
  storeId: number;
  date?: string;
}): Promise<EmployeeAttendanceSummary[]> {
  const res = await apiClient.get<EmployeeAttendanceSummary[]>(
    "/owner/attendance/summary",
    { params },
  );
  return res.data || [];
}

/* ───────── 출퇴근 로그 리스트(사장용) ───────── */

/** 사장페이지에서 보는 출퇴근 로그 1건 */
export type OwnerAttendanceLogItem = {
  logId: number;
  recordTime: string; // ISO datetime
  recordType: "IN" | "OUT";
  employeeId: number;
  storeId: number;
  employeeName?: string | null;
  clientIp?: string | null;
};

/**
 * 사장페이지 - 특정 사업장 / 날짜 기준 전체 출퇴근 로그 조회
 * GET /owner/attendance/logs
 */
export async function fetchOwnerAttendanceLogs(params: {
  storeId: number;
  date: string;
}): Promise<OwnerAttendanceLogItem[]> {
  const res = await apiClient.get<OwnerAttendanceLogItem[]>(
    "/attendance/owner/logs",
    { params: { storeId: params.storeId,
        from: params.date,   // 👈 추가
        to: params.date   } },
  );
  return res.data || [];
}

/* ───────── 공용 에러 메시지 ───────── */
export function extractErrorMessage(e: any): string {
  return utilExtractErrorMessage(e);
}