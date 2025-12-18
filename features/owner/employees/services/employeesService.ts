// features/owner/employees/services/employeesService.ts
import { apiClient } from "@/shared/api/apiClient";
import { extractErrorMessage as utilExtractErrorMessage } from "@/shared/utils/commonUtils";
import type { Employee } from "@/shared/types/database";

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

// 🔹 이 모듈에서만 쓰는 확장 타입: assignmentId 포함
export type StoreEmployee = Employee & { assignmentId?: number | null };

/**
 * ✅ 현재 사업장(storeId)의 직원 목록 조회
 *   - 백엔드 EmployeeResponse에 assignmentId가 포함된다고 가정
 */
export async function fetchEmployees(storeId: number): Promise<StoreEmployee[]> {
  const res = await apiClient.get<any[]>(`/employees`, {
    params: { storeId },
  });

  const rows = res.data || [];

  return rows.map((raw: any): StoreEmployee => {
    // 🔹 만약 { employee: { ... } } 형태라면 안쪽 employee를 우선 사용
    const src = raw.employee ?? raw;

    return {
      employeeId: src.employeeId ?? src.id ?? src.employee_id,
      name: src.name ?? src.employeeName ?? src.employee_name ?? "",
      email: src.email ?? "",
      phone: src.phone ?? "",
      provider: src.provider ?? src.providerType ?? "",
      provider_id: src.provider_id ?? src.providerId ?? null,
      createdAt: src.createdAt ?? src.created_at ?? null,
      // ✅ 배정 ID도 같이 실어둔다 (사장 화면에서 직원 제거 시 사용)
      assignmentId: raw.assignmentId ?? raw.assignment_id ?? null,
    };
  });
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

/**
 * ✅ 직원 삭제 → 실제로는 "사업장 배정 해제"
 *  - employee가 아니라 employee_assignment를 기준으로 삭제/해제
 *  - 백엔드: DELETE /assignments/{assignmentId} 에 연결
 */
export async function deleteEmployee(assignmentId: number) {
  await apiClient.delete(`/employees/${assignmentId}`);
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
  workDaysThisMonth: number; // 총 근무일수
  workHoursThisMonth: number; // 총 근무시간 (시간 단위)
};

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