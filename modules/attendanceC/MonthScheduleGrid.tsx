// modules/attendanceC/MonthScheduleGrid.tsx
"use client";

import { format, isSameMonth } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/shared/utils/commonUtils";

import type { Employee, EmployeeShift } from "./attendanceTypes";

export type MonthScheduleGridProps = {
  dates: Date[];
  shifts: EmployeeShift[];
  employees: Employee[];
  onDayCreate: (dateStr: string) => void;
  onShiftClick?: (shift: EmployeeShift) => void;
  readOnly?: boolean;
};

export default function MonthScheduleGrid({
  dates,
  shifts,
  employees,
  onDayCreate,
  onShiftClick,
  readOnly = false,
}: MonthScheduleGridProps) {
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

  const shiftMap: Record<string, EmployeeShift[]> = {};
  shifts.forEach((s: any) => {
    if (!s.shiftDate) return;
    const key = s.shiftDate.length > 10 ? s.shiftDate.slice(0, 10) : s.shiftDate;
    if (!shiftMap[key]) shiftMap[key] = [];
    shiftMap[key].push(s);
  });

  const employeeMap = new Map<number, Employee>();
  employees.forEach((e) => employeeMap.set(e.employeeId, e));

  if (!dates.length) {
    return <p className="text-sm text-muted-foreground">표시할 날짜가 없습니다.</p>;
  }

  const currentMonth = dates[15]?.getMonth() ?? new Date().getMonth();

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="grid grid-cols-7 bg-muted text-xs sm:text-sm">
        {["일", "월", "화", "수", "목", "금", "토"].map((label, idx) => {
          const isSat = idx === 0;
          const isSun = idx === 6;
          return (
            <div
              key={label}
              className={cn(
                "px-2 py-2 text-center border-b font-medium",
                isSun && "bg-blue-50 text-blue-700",
                isSat && "bg-red-50 text-red-700"
              )}
            >
              {label}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-7 text-xs sm:text-sm">
        {dates.map((d, idx) => {
          const dateStr = getDateStr(d);
          const rawShifts = shiftMap[dateStr] ?? [];

          const sortedShifts = [...rawShifts].sort((a, b) =>
            a.startTime.localeCompare(b.startTime)
          );

          const isOtherMonth = !isSameMonth(d, new Date(d.getFullYear(), currentMonth, 1));
          const isSat = idx % 7 === 5;
          const isSun = idx % 7 === 6;

          return (
            <div
              key={dateStr + idx}
              className={cn(
                "border-t border-r last:border-r-0 min-h-[100px] p-1 flex flex-col gap-1 transition-colors hover:bg-slate-50",
                isOtherMonth && "bg-muted/40 text-muted-foreground",
                !isOtherMonth && isSat && "bg-blue-50/30",
                !isOtherMonth && isSun && "bg-red-50/30"
              )}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={cn("text-[11px] font-medium", isOtherMonth && "opacity-50")}>
                  {format(d, "d", { locale: ko })}
                </span>

                {!readOnly && (
                  <button
                    className="text-[11px] text-primary hover:bg-primary/10 w-5 h-5 rounded flex items-center justify-center transition-colors"
                    onClick={() => onDayCreate(dateStr)}
                    title="근무 추가"
                  >
                    +
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                {sortedShifts.map((s: any) => {
                  const emp = employeeMap.get(s.employeeId);
                  const label = emp?.name ?? s.employeeName ?? `직원 #${s.employeeId}`;
                  const empColor = getEmpColor(s.employeeId);

                  const isContinue = !!s.isNightContinue;

                  return (
                    <div
                      key={s.shiftId}
                      className={cn(
                        "rounded border px-1 py-0.5 text-[10px] sm:text-[11px] transition-all",
                        empColor,
                        !readOnly && !isContinue && "cursor-pointer hover:opacity-80",
                        isContinue && "opacity-70"
                      )}
                      onClick={() => {
                        if (readOnly) return;
                        if (isContinue) return;
                        onShiftClick?.(s);
                      }}
                    >
                      <div className="flex items-center justify-between gap-2 leading-tight">
                        <div className="font-semibold truncate">
                          {label}
                          {isContinue && <span className="font-normal opacity-80"> ↪ (이어짐)</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          {s.isFixed && <span className="text-[10px]">📌</span>}
                          {s.isNight && <span className="text-[10px]">🌙</span>}
                        </div>
                      </div>

                      <div className="text-[9px] opacity-80 leading-none mt-0.5">
                        {s.startTime}~{s.endTime}
                        {s.breakMinutes ? ` (${s.breakMinutes}분)` : ""}
                      </div>
                    </div>
                  );
                })}

                {sortedShifts.length === 0 && !isOtherMonth && (
                  <div
                    className="h-full min-h-[20px]"
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