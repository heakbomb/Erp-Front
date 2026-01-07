// modules/attendanceC/WeekScheduleGrid.tsx
"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/shared/utils/commonUtils";

import type { Employee, EmployeeShift } from "./attendanceTypes";

export type WeekScheduleGridProps = {
  days: Date[];
  shifts: EmployeeShift[];
  employees: Employee[];
  onDayCreate: (dateStr: string) => void;
  onShiftClick?: (shift: EmployeeShift) => void;
  readOnly?: boolean;
};

export default function WeekScheduleGrid({
  days,
  shifts,
  employees,
  onDayCreate,
  onShiftClick,
  readOnly = false,
}: WeekScheduleGridProps) {
  // ✅ 날짜 셀 key는 로컬 기준 yyyy-MM-dd
  const getDateStr = (d: Date) => {
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
  };

  const COLORS = [
    "bg-red-100",
    "bg-blue-100",
    "bg-green-100",
    "bg-yellow-100",
    "bg-purple-100",
    "bg-pink-100",
    "bg-teal-100",
    "bg-orange-100",
  ];
  const getEmpColor = (employeeId: number) => {
    const idx = Math.abs(employeeId) % COLORS.length;
    return COLORS[idx];
  };

  // ✅ shiftDate는 Date로 파싱하지 말고 문자열 그대로 yyyy-MM-dd로 사용 (UTC 밀림 방지)
  const toYmd = (shiftDate: string) =>
    shiftDate.length > 10 ? shiftDate.slice(0, 10) : shiftDate;

  const dayShiftsMap: Record<string, EmployeeShift[]> = {};
  shifts.forEach((s: any) => {
    if (!s.shiftDate) return;
    const key = toYmd(s.shiftDate);
    if (!dayShiftsMap[key]) dayShiftsMap[key] = [];
    dayShiftsMap[key].push(s);
  });

  const employeeMap = new Map<number, Employee>();
  employees.forEach((e) => employeeMap.set(e.employeeId, e));

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 bg-muted text-xs sm:text-sm border-b">
        {days.map((d, idx) => {
          const isSat = idx === 6;
          const isSun = idx === 0;

          return (
            <div
              key={idx}
              className={cn(
                "px-2 py-3 text-center border-r last:border-r-0",
                isSat && "bg-blue-50",
                isSun && "bg-red-50"
              )}
            >
              <div
                className={cn(
                  "font-semibold text-sm",
                  !isSat && !isSun && "text-black",
                  isSat && "text-blue-700",
                  isSun && "text-red-700"
                )}
              >
                {format(d, "EEE", { locale: ko })}
              </div>

              <div
                className={cn(
                  "text-[11px] mt-0.5",
                  !isSat && !isSun && "text-black",
                  isSat && "text-blue-700",
                  isSun && "text-red-700"
                )}
              >
                {format(d, "MM/dd")}
              </div>
            </div>
          );
        })}
      </div>

      {/* 날짜 셀 */}
      <div className="grid grid-cols-7 min-h-[600px] text-xs sm:text-sm">
        {days.map((d, idx) => {
          const dateStr = getDateStr(d);
          const rawShifts = dayShiftsMap[dateStr] ?? [];

          const isSat = idx === 6;
          const isSun = idx === 0;

          const sortedShifts = [...rawShifts].sort((a, b) =>
            a.startTime.localeCompare(b.startTime)
          );

          return (
            <div
              key={dateStr}
              className={cn(
                "border-r last:border-r-0 p-2 flex flex-col gap-2 h-full",
                isSat && "bg-blue-50/30",
                isSun && "bg-red-50/30"
              )}
            >
              <div className="flex justify-between items-center">
                <span
                  className={cn(
                    "text-xs font-medium",
                    !isSat && !isSun && "text-black",
                    isSat && "text-blue-700",
                    isSun && "text-red-700"
                  )}
                >
                  {format(d, "d", { locale: ko })}
                </span>

                {!readOnly && (
                  <button
                    type="button"
                    className="text-[11px] font-medium text-primary hover:bg-primary/10 px-1.5 py-0.5 rounded transition-colors"
                    onClick={() => onDayCreate(dateStr)}
                  >
                    + 추가
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                {sortedShifts.map((s: any) => {
                  const emp = employeeMap.get(s.employeeId);
                  const label = emp?.name ?? s.employeeName ?? `직원#${s.employeeId}`;
                  const empColor = getEmpColor(s.employeeId);

                  const isContinue = !!s.isNightContinue;

                  return (
                    <div
                      key={s.shiftId}
                      className={cn(
                        "rounded border px-2 py-1.5 text-[11px] leading-tight shadow-sm transition-all",
                        empColor,
                        !readOnly && !isContinue && "cursor-pointer hover:opacity-80 hover:translate-y-[-1px]",
                        isContinue && "opacity-70" // ✅ 시각적 큰 변화 없이 살짝만
                      )}
                      onClick={() => {
                        // ✅ 이어짐 카드는 클릭 차단
                        if (readOnly) return;
                        if (isContinue) return;
                        onShiftClick?.(s);
                      }}
                    >
                      {/* ✅ 고정(📌) + 야간(🌙) */}
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <div className="font-bold truncate">
                          {label}
                          {isContinue && <span className="font-normal opacity-80"> ↪ (이어짐)</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          {s.isFixed && <span className="text-[11px]">📌</span>}
                          {s.isNight && <span className="text-[11px]">🌙</span>}
                        </div>
                      </div>

                      <div className="text-[10px] opacity-80">
                        {s.startTime} ~ {s.endTime}
                        {s.breakMinutes ? ` (${s.breakMinutes}분)` : ""}
                      </div>
                    </div>
                  );
                })}

                {sortedShifts.length === 0 && (
                  <div
                    className="flex-1 min-h-[50px] cursor-pointer"
                    onClick={() => !readOnly && onDayCreate(dateStr)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}