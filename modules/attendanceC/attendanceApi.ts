// modules/attendanceC/attendanceApi.ts
import { apiClient } from "@/shared/api/apiClient";
import type {
  AttendanceItem,
  BulkShiftPayload,
  DeleteShiftRangeParams,
  EmployeeShift,
  MobileAttendanceItem,
  MobilePunchPayload,
  PunchPayload,
  SaveShiftPayload,
  ShiftQueryParams,
  EmployeeAttendanceSummary,
  OwnerAttendanceLogItem
} from "./attendanceTypes";

// 헬퍼: 날짜 범위에 포함된 모든 (년, 월) 쌍을 구함
function getMonthsInRange(from: string, to: string) {
  const start = new Date(from);
  const end = new Date(to);
  const months: { year: number; month: number }[] = [];

  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endDate = new Date(end.getFullYear(), end.getMonth(), 1);

  while (current <= endDate) {
    months.push({ year: current.getFullYear(), month: current.getMonth() + 1 });
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}

/* ----------------------------------
   기존 attendanceApi 객체 (Employee/Shared 기능)
---------------------------------- */
export const attendanceApi = {
  /* --- 직원 출퇴근 (Desktop) --- */
  fetchRecentAttendance: async (employeeId: number, storeId: number) => {
    const res = await apiClient.get<AttendanceItem[]>(`/attendance/recent`, {
      params: { employeeId, storeId },
    });
    return res.data ?? [];
  },

  fetchDayAttendance: async (employeeId: number, storeId: number, date: string) => {
    const res = await apiClient.get<AttendanceItem[]>(`/attendance/day`, {
      params: { employeeId, storeId, date },
    });
    return res.data ?? [];
  },

  punchAttendance: async (payload: PunchPayload) => {
    await apiClient.post(`/attendance/punch`, payload);
  },

  /* --- 모바일 출퇴근 (Mobile) --- */
  fetchRecentMobileAttendance: async (employeeId: number, storeId: number) => {
    const res = await apiClient.get<MobileAttendanceItem[]>("/attendance/recent", {
      params: { employeeId, storeId },
    });
    return res.data ?? [];
  },

  punchMobileAttendance: async (payload: MobilePunchPayload) => {
    await apiClient.post("/attendance/punch", payload);
  },

  /* --- 시프트 (Shift) 관리 --- */
  fetchShifts: async (params: ShiftQueryParams) => {
    const { storeId, from, to } = params;
    const targets = getMonthsInRange(from, to);

    const responses = await Promise.all(
      targets.map(({ year, month }) =>
        apiClient.get<EmployeeShift[]>(`/shift/monthly`, {
          params: { storeId, year, month },
        })
      )
    );

    const allShifts = responses.flatMap(res => res.data || []);
    const uniqueShifts = Array.from(
      new Map(allShifts.map(s => [s.shiftId, s])).values()
    );

    return uniqueShifts;
  },

  createShift: async (payload: SaveShiftPayload) => {
    const normalize = (t: string) => (t.length === 5 ? `${t}:00` : t);
    const body = {
      storeId: payload.storeId,
      employeeId: payload.employeeId,
      shiftDate: payload.date,
      startTime: normalize(payload.startTime),
      endTime: normalize(payload.endTime),
      breakMinutes: payload.breakMinutes ?? 0,
      isFixed: payload.isFixed ?? false,
    };
    const res = await apiClient.post<EmployeeShift>(`/shift`, body);
    return res.data;
  },

  updateShift: async (storeId: number, shiftId: number, body: Partial<SaveShiftPayload>) => {
    const normalize = (t?: string) => (!t ? undefined : t.length === 5 ? `${t}:00` : t);

    const res = await apiClient.post<EmployeeShift>(`/shift`, {
      shiftId,
      storeId,
      employeeId: body.employeeId,
      shiftDate: body.date,
      startTime: normalize(body.startTime),
      endTime: normalize(body.endTime),
      breakMinutes: typeof body.breakMinutes === "number" ? body.breakMinutes : undefined,
      isFixed: body.isFixed ?? false,
    });
    return res.data;
  },

  createShiftBulk: async (payload: BulkShiftPayload) => {
    const normalize = (t: string) => (t.length === 5 ? `${t}:00` : t);
    const body = {
      ...payload,
      startTime: normalize(payload.startTime),
      endTime: normalize(payload.endTime),
    };
    const res = await apiClient.post<EmployeeShift[]>("/shift/bulk", body);
    return res.data;
  },

  deleteShift: async (storeId: number, shiftId: number) => {
    await apiClient.delete(`/shift/${shiftId}`, { params: { storeId } });
  },

  deleteShiftRange: async (params: DeleteShiftRangeParams) => {
    await apiClient.delete("/shift/range", { params });
  },
};

/* ----------------------------------
   [추가] 사장님용 출결 조회 (Named Exports)
   - useEmployeesAttendance.ts에서 import { ... } 형태로 사용 중
---------------------------------- */

// 1. 직원별 월간 출결 요약 조회
export async function fetchEmployeesAttendanceSummary(params: {
  storeId: number;
  month: string; // "yyyy-MM"
}): Promise<EmployeeAttendanceSummary[]> {
  const res = await apiClient.get<EmployeeAttendanceSummary[]>("/attendance/owner/summary", {
    params,
  });
  return res.data;
}

// 2. 일별 출퇴근 로그 조회
export async function fetchOwnerAttendanceLogs(params: {
  storeId: number;
  date: string; // "yyyy-MM-dd"
}): Promise<OwnerAttendanceLogItem[]> {
  const res = await apiClient.get<OwnerAttendanceLogItem[]>("/attendance/owner/logs", {
    params: {
      storeId: params.storeId,
      from: params.date,
      to: params.date,
    },
  });
  return res.data;
}