"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/shared/utils/commonUtils";
import type { EmployeeShift } from "./attendanceTypes";
import type { Employee } from "@/modules/employeeC/employeeTypes";

export type ScheduleGridProps = {
  days: Date[];
  shifts: EmployeeShift[];
  employees: Employee[];
  onDayCreate?: (dateStr: string) => void;
  onShiftClick?: (shift: EmployeeShift) => void;
  readOnly?: boolean;

  /** ✅ 달력 코너에 고정 범례 표시 */
  showFixedLegend?: boolean;
};

export default function ScheduleGrid({
  days,
  shifts,
  employees,
  onDayCreate,
  onShiftClick,
  readOnly = false,
  showFixedLegend = true,
}: ScheduleGridProps) {
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
  const getEmpColor = (employeeId: number) =>
    COLORS[Math.abs(employeeId) % COLORS.length];

  const dayShiftsMap: Record<string, EmployeeShift[]> = {};
  shifts.forEach((s) => {
    if (!s.shiftDate) return;
    const key = getDateStr(new Date(s.shiftDate));
    if (!dayShiftsMap[key]) dayShiftsMap[key] = [];
    dayShiftsMap[key].push(s);
  });

  const employeeMap = new Map<number, Employee>();
  employees.forEach((e) => employeeMap.set(e.employeeId, e));

  // ✅ 실제로 고정 스케줄이 1개라도 있을 때만 범례를 띄움(원하면 항상 띄우려면 이 줄 지워도 됨)
  const hasFixed = shifts?.some((s) => !!s.isFixed);

  return (
    <div className="relative border rounded-lg overflow-hidden bg-white shadow-sm">
      {/* ✅ 달력 왼쪽 위 고정 범례 (그리드 내부 코너) */}
      {showFixedLegend && hasFixed && (
        <div className="absolute left-2 top-2 z-20">
          <div className="inline-flex items-center gap-1 rounded-md border bg-white/90 px-2 py-1 text-xs text-muted-foreground shadow-sm">
            <span>📌</span>
            <span>고정 근무 스케줄</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-7 bg-muted text-xs sm:text-sm">
        {days.map((d, idx) => {
          const isSat = idx === 5;
          const isSun = idx === 6;
          return (
            <div
              key={idx}
              className={cn(
                "px-2 py-2 text-center border-b",
                isSat && "bg-blue-100 text-blue-700",
                isSun && "bg-red-100 text-red-700"
              )}
            >
              <div className="font-semibold">{format(d, "EEE", { locale: ko })}</div>
              <div className="text-[11px] text-muted-foreground">
                {format(d, "MM/dd")}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-7 min-h-[240px] text-xs sm:text-sm">
        {days.map((d, idx) => {
          const dateStr = getDateStr(d);
          const raw = dayShiftsMap[dateStr] ?? [];

          // ✅ 시간순 정렬
          const dayShifts = [...raw].sort((a, b) => a.startTime.localeCompare(b.startTime));

          const isSat = idx === 5;
          const isSun = idx === 6;

          return (
            <div
              key={dateStr}
              className={cn(
                "border-t border-r last:border-r-0 p-1 sm:p-2 flex flex-col gap-1",
                isSat && "bg-blue-50",
                isSun && "bg-red-50"
              )}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] text-muted-foreground">
                  {format(d, "d일", { locale: ko })}
                </span>

                {!readOnly && onDayCreate && (
                  <button
                    type="button"
                    className="text-[11px] text-primary hover:underline"
                    onClick={() => onDayCreate(dateStr)}
                  >
                    + 추가
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                {dayShifts.map((s) => {
                  const emp = employeeMap.get(s.employeeId);
                  const label = emp?.name ?? s.employeeName ?? `직원#${s.employeeId}`;

                  return (
                    <div
                      key={s.shiftId}
                      className={cn(
                        "cursor-pointer rounded border px-2 py-1 text-[11px] leading-tight hover:opacity-80 shadow-sm",
                        getEmpColor(s.employeeId)
                      )}
                      onClick={() => !readOnly && onShiftClick?.(s)}
                    >
                      {/* ✅ 이름줄 + 고정 핀 표시 */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold truncate">{label}</div>
                        {s.isFixed && <span className="text-[12px]">📌</span>}
                      </div>

                      <div className="text-[10px] opacity-80">
                        {s.startTime} ~ {s.endTime}
                        {s.breakMinutes ? ` (${s.breakMinutes}분)` : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
