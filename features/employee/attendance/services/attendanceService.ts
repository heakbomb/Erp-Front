// features/employee/attendance/services/attendanceService.ts
import axios from "axios";

// ✅ 백엔드 베이스 URL (기존과 동일)
const API_BASE = "http://localhost:8080";

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
  const res = await axios.get<AttendanceItem[]>(`${API_BASE}/attendance/recent`, {
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
  const res = await axios.get<AttendanceItem[]>(`${API_BASE}/attendance/day`, {
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
  await axios.post(`${API_BASE}/attendance/punch`, payload);
}