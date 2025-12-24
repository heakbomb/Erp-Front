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

  const dayShiftsMap: Record<string, EmployeeShift[]> = {};
  shifts.forEach((s) => {
    if (!s.shiftDate) return;
    const key = getDateStr(new Date(s.shiftDate));
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
          const isSat = idx === 5;
          const isSun = idx === 6;
          return (
            <div
              key={idx}
              className={cn(
                "px-2 py-3 text-center border-r last:border-r-0",
                isSat && "bg-blue-50 text-blue-700",
                isSun && "bg-red-50 text-red-700"
              )}
            >
              <div className="font-semibold text-sm">
                {format(d, "EEE", { locale: ko })}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
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
          const isSat = idx === 5;
          const isSun = idx === 6;

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
                <span className="text-xs font-medium text-gray-500">
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
                {sortedShifts.map((s) => {
                  const emp = employeeMap.get(s.employeeId);
                  const label = emp?.name ?? s.employeeName ?? `직원#${s.employeeId}`;
                  const empColor = getEmpColor(s.employeeId);

                  return (
                    <div
                      key={s.shiftId}
                      className={cn(
                        "cursor-pointer rounded border px-2 py-1.5 text-[11px] leading-tight hover:opacity-80 shadow-sm transition-all hover:translate-y-[-1px]",
                        empColor
                      )}
                      onClick={() => {
                        if (!readOnly) onShiftClick?.(s);
                      }}
                    >
                      {/* ✅ 고정일 때만 📌 */}
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <div className="font-bold truncate">{label}</div>
                        {s.isFixed && <span className="text-[11px]">📌</span>}
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
