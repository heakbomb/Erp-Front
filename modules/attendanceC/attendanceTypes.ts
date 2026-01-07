// modules/attendanceC/attendanceTypes.ts

/* --- 기본 데이터 타입 --- */
export interface AttendanceItem {
  logId: number;
  employeeId: number;
  storeId: number;
  recordTime: string; // ISO
  recordType: "IN" | "OUT";
  clientIp?: string | null;
}

export interface MobileAttendanceItem {
  recordTime: string;
  recordType: "IN" | "OUT";
  // ✅ shift 기준으로 IN/OUT 판단하려면 필요
  shiftId: number | null;
}

/* --- 직원(Employee) 관련 (Grid 표시용) --- */
export interface Employee {
  employeeId: number;
  name: string;
  email?: string | null;
  phone?: string | null;
}

/* --- 시프트(Shift) 관련 --- */
export interface EmployeeShift {
  shiftId: number;
  storeId: number;
  employeeId: number;
  shiftDate: string;
  startTime: string;
  endTime: string;
  breakMinutes?: number;
  isFixed?: boolean;
  employeeName?: string;
  color?: string;

  // ✅ 프론트 전용 메타
  isNight?: boolean;
  groupShiftIds?: number[];       // [part1Id, part2Id]
  nightStartDate?: string;        // 시작일(1/5)
  nightSecondDate?: string;       // 다음날(1/6)
  isNightContinuation?: boolean;  // ✅ [추가] 다음날 “이어짐 표시”(클릭 불가)
}

/* --- API 요청 파라미터 --- */
export interface ShiftQueryParams {
  storeId: number;
  from: string; // "YYYY-MM-DD" or "YYYY"
  to: string; // "YYYY-MM-DD" or "MM"
}

export interface SaveShiftPayload {
  storeId: number;
  employeeId: number;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes?: number | null;
  isFixed?: boolean;
  shiftId?: number;
}

export interface BulkShiftPayload {
  storeId: number;
  employeeId: number;
  dates: string[];
  startTime: string;
  endTime: string;
  breakMinutes?: number | null;
  isFixed?: boolean;
}

export interface DeleteShiftRangeParams {
  storeId: number;
  employeeId: number;
  from: string;
  to: string;
}

/* --- QR/모바일 펀치 --- */
export interface PunchPayload {
  employeeId: number;
  storeId: number;
  recordTime: string;
  recordType: "IN" | "OUT";
}

export interface MobilePunchPayload {
  employeeId: number;
  storeId: number;
  recordType: "IN" | "OUT";
  qrCode: string;
  latitude: number | null;
  longitude: number | null;

  // ✅ shift 연동
  shiftId: number;
}

/* --- ✅ [추가] 현재 shift 상태(버튼 활성화 판단용) --- */
export interface AttendanceShiftStatus {
  shiftId: number | null;
  shiftDate: string | null;

  canClockIn: boolean;
  canClockOut: boolean;

  // UI 메시지(예: "현재 근무 시간이 아닙니다.", "이미 출근 처리됨" 등)
  message?: string | null;
}

/* --- 사장님용 출결 조회 --- */
export interface EmployeeAttendanceSummary {
  employeeId: number;
  employeeName: string;
  workDaysThisMonth: number;
  workHoursThisMonth: number;
}

export interface OwnerAttendanceLogItem {
  logId: number;
  employeeId: number;
  employeeName: string;
  recordTime: string; // ISO string
  recordType: "IN" | "OUT";
}