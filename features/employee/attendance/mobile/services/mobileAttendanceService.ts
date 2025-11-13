// features/employee/attendance/mobile/services/mobileAttendanceService.ts
import { apiClient } from "@/lib/api/client"; // ✅ apiClient 사용

export type MobileAttendanceItem = {
  recordTime: string;
  recordType: "IN" | "OUT";
};

export async function fetchRecentMobileAttendance(employeeId: number, storeId: number) {
  const res = await apiClient.get<MobileAttendanceItem[]>("/attendance/recent", { // ✅ apiClient 사용
    params: { employeeId, storeId },
  });
  return res.data ?? [];
}

export async function punchMobileAttendance(payload: {
  employeeId: number;
  storeId: number;
  recordType: "IN" | "OUT";
  qrCode: string;
  latitude: number | null;
  longitude: number | null;
}) {
  await apiClient.post("/attendance/punch", payload); // ✅ apiClient 사용
}