// features/owner/shifts/services/employeeShiftService.ts
import { apiClient } from "@/shared/api/apiClient";
import type { EmployeeShift } from "@/shared/types/database";

export type ShiftQueryParams = {
  storeId: number;
  from: string;
  to: string;
};

export async function fetchShifts(params: ShiftQueryParams) {
  const { storeId, from } = params;

  const res = await apiClient.get(`/shift/monthly`, {
    params: {
      storeId,
      year: Number(from.slice(0, 4)),
      month: Number(from.slice(5, 7)),
    },
  });

  return res.data as EmployeeShift[];
}

// 🔥 isFixed optional 로 변경
export type SaveShiftPayload = {
  storeId: number;
  employeeId: number;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes?: number | null;
  isFixed?: boolean;   // 🔥 optional
  shiftId?: number;
};

export async function createShift(payload: SaveShiftPayload) {
  const normalize = (t: string) => (t.length === 5 ? `${t}:00` : t);

  const body = {
    shiftId: payload.shiftId ?? null,
    storeId: payload.storeId,
    employeeId: payload.employeeId,
    shiftDate: payload.date,              // 🔥 date → shiftDate
    startTime: normalize(payload.startTime),
    endTime: normalize(payload.endTime),
    breakMinutes: payload.breakMinutes ?? 0, // 🔥 휴게시간도 같이 전송
    isFixed: payload.isFixed ?? false,       // 🔥 기본값 false
  };

  return (await apiClient.post(`/shift`, body)).data as EmployeeShift;
}

export async function updateShift(
  storeId: number,
  shiftId: number,
  body: Partial<SaveShiftPayload>
) {
  const normalize = (t?: string) =>
    !t ? undefined : t.length === 5 ? `${t}:00` : t;

  const res = await apiClient.post(`/shift`, {
    shiftId,
    storeId,
    employeeId: body.employeeId,
    shiftDate: body.date,                 // 🔥 date → shiftDate
    startTime: normalize(body.startTime),
    endTime: normalize(body.endTime),
    breakMinutes:
      typeof body.breakMinutes === "number" ? body.breakMinutes : undefined,
    isFixed: body.isFixed ?? false,
  });

  return res.data as EmployeeShift;
}

// ✅ 월간/기간별 근무 일괄 등록용 payload
export type BulkShiftPayload = {
  storeId: number;
  employeeId: number;
  dates: string[];      // 'YYYY-MM-DD' 리스트
  startTime: string;    // 'HH:mm' or 'HH:mm:ss'
  endTime: string;
  breakMinutes?: number | null;
  isFixed?: boolean;
};

// ✅ 월간/기간별 근무 일괄 등록 API
export async function createShiftBulk(payload: BulkShiftPayload) {
  const normalize = (t: string) => (t.length === 5 ? `${t}:00` : t); // 09:00 -> 09:00:00

  const body = {
    ...payload,
    startTime: normalize(payload.startTime),
    endTime: normalize(payload.endTime),
  };

  const res = await apiClient.post("/shift/bulk", body);
  return res.data as EmployeeShift[];
}
export async function deleteShift(storeId: number, shiftId: number) {
  return (await apiClient.delete(`/shift/${shiftId}`)).data;
}

// ✅ 추가: 기간 일괄 삭제용 파라미터 타입
export type DeleteShiftRangeParams = {
  storeId: number
  employeeId: number
  from: string // "2025-12-01"
  to: string   // "2025-12-31"
}

// ✅ 추가: 기간 일괄 삭제 API
export async function deleteShiftRange(params: DeleteShiftRangeParams) {
  const res = await apiClient.delete("/shift/range", {
    params,
  })
  return res.data
}


