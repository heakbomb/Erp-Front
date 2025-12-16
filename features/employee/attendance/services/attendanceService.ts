// features/employee/attendance/services/attendanceService.ts
import { apiClient } from "@/shared/api/apiClient"; // ✅ apiClient 사용

export type AttendanceItem = {
  logId: number;
  employeeId: number;
  storeId: number;
  recordTime: string; // ISO
  recordType: "IN" | "OUT";
  clientIp?: string | null;
};

// 최근 기록
export async function fetchRecentAttendance(employeeId: number, storeId: number) {
  const res = await apiClient.get<AttendanceItem[]>(`/attendance/recent`, { // ✅ apiClient 사용
    params: { employeeId, storeId },
  });
  return res.data ?? [];
}

// 특정 날짜 기록
export async function fetchDayAttendance(
  employeeId: number,
  storeId: number,
  date: string
) {
  const res = await apiClient.get<AttendanceItem[]>(`/attendance/day`, { // ✅ apiClient 사용
    params: { employeeId, storeId, date },
  });
  return res.data ?? [];
}

// 출근/퇴근 기록
export async function punchAttendance(payload: {
  employeeId: number;
  storeId: number;
  recordTime: string;
  recordType: "IN" | "OUT";
}) {
  await apiClient.post(`/attendance/punch`, payload); // ✅ apiClient 사용
}