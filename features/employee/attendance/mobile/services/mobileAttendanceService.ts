// features/employee/attendance/mobile/services/mobileAttendanceService.ts
import axios from "axios";

const resolveApiBase = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return "";
    }
  }
  return "http://localhost:8080";
};

const API_BASE = resolveApiBase();

export type MobileAttendanceItem = {
  recordTime: string;
  recordType: "IN" | "OUT";
};

const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  validateStatus: (s) => s >= 200 && s < 300,
});

export async function fetchRecentMobileAttendance(employeeId: number, storeId: number) {
  const res = await api.get<MobileAttendanceItem[]>("/attendance/recent", {
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
  await api.post("/attendance/punch", payload);
}