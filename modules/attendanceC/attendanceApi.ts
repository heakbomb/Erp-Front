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
  OwnerAttendanceLogItem,
  AttendanceShiftStatus,
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

// ✅ 로컬 오늘 yyyy-MM-dd
function getLocalTodayYMD(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* =========================
   ✅ [핵심] ShiftApiResult 언랩
   - 백엔드가 200으로 내려줘도 success=false면 throw
========================= */
type ShiftApiResult<T> = {
  success: boolean;
  code?: string | null;
  message?: string | null;
  data?: T | null;
};

function unwrapShiftResult<T>(res: ShiftApiResult<T>): T {
  if (res?.success) {
    if (res.data == null) throw new Error("요청 처리 중 오류가 발생했습니다.");
    return res.data as T;
  }
  const msg = res?.message || "요청 처리 중 오류가 발생했습니다.";
  throw new Error(msg);
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

  /* --- ✅ 현재 shift 상태 --- */
  fetchAttendanceShiftStatus: async (employeeId: number, storeId: number) => {
    const res = await apiClient.get<AttendanceShiftStatus>("/attendance/shift/status", {
      params: { employeeId, storeId },
    });
    return res.data;
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

    const allShifts = responses.flatMap((res) => res.data || []);
    const uniqueShifts = Array.from(new Map(allShifts.map((s) => [s.shiftId, s])).values());
    return uniqueShifts;
  },

  // ✅ 단건 생성: ShiftApiResult 언랩
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

    const res = await apiClient.post<ShiftApiResult<EmployeeShift>>(`/shift`, body);
    return unwrapShiftResult(res.data);
  },

  // ✅ 수정: ShiftApiResult 언랩
  updateShift: async (storeId: number, shiftId: number, body: Partial<SaveShiftPayload>) => {
    const normalize = (t?: string) => (!t ? undefined : t.length === 5 ? `${t}:00` : t);

    const payload: any = {
      shiftId,
      storeId,
      employeeId: body.employeeId,
      shiftDate: body.date,
      startTime: normalize(body.startTime),
      endTime: normalize(body.endTime),
    };

    if (typeof body.breakMinutes === "number") payload.breakMinutes = body.breakMinutes;
    if (typeof body.isFixed === "boolean") payload.isFixed = body.isFixed;

    const res = await apiClient.post<ShiftApiResult<EmployeeShift>>(`/shift`, payload);
    return unwrapShiftResult(res.data);
  },

  // ✅ 월간/기간 일괄: ShiftApiResult 언랩
  createShiftBulk: async (payload: BulkShiftPayload) => {
    const normalize = (t: string) => (t.length === 5 ? `${t}:00` : t);
    const body = {
      ...payload,
      startTime: normalize(payload.startTime),
      endTime: normalize(payload.endTime),
      isFixed: payload.isFixed ?? false,
    };

    const res = await apiClient.post<ShiftApiResult<EmployeeShift[]>>("/shift/bulk", body);
    return unwrapShiftResult(res.data);
  },

  deleteShift: async (storeId: number, shiftId: number) => {
    await apiClient.delete(`/shift/${shiftId}`, { params: { storeId } });
  },

  deleteShiftRange: async (params: DeleteShiftRangeParams) => {
    await apiClient.delete("/shift/range", { params });
  },
};

/* --- 사장님용 출결 조회 --- */
export async function fetchEmployeesAttendanceSummary(params: {
  storeId: number;
  month: string; // "yyyy-MM"
}): Promise<EmployeeAttendanceSummary[]> {
  const res = await apiClient.get<EmployeeAttendanceSummary[]>("/attendance/owner/summary", {
    params,
  });
  return res.data;
}

export async function fetchOwnerAttendanceLogs(params: {
  storeId: number;
  from: string; // "yyyy-MM-dd"
  to: string; // "yyyy-MM-dd"
}): Promise<OwnerAttendanceLogItem[]> {
  const res = await apiClient.get<OwnerAttendanceLogItem[]>("/attendance/owner/logs", {
    params: {
      storeId: params.storeId,
      from: params.from,
      to: params.to,
    },
  });
  return res.data ?? [];
}

// ✅ 3. 오늘 출퇴근 로그 조회 (백엔드 수정 X, 기존 logs 재사용)
export async function fetchOwnerTodayAttendanceLogs(storeId: number) {
  const today = getLocalTodayYMD();
  return fetchOwnerAttendanceLogs({ storeId, from: today, to: today });
}