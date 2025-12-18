// features/owner/shifts/components/WeekScheduleGrid.tsx
"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/shared/utils/commonUtils";

import type { Employee, EmployeeShift } from "@/shared/types/database";

export type WeekScheduleGridProps = {
  days: Date[];
  shifts: EmployeeShift[];
  employees: Employee[];
  onDayCreate: (dateStr: string) => void;
  onShiftClick?: (shift: EmployeeShift) => void;
  /** ✅ 직원페이지용 읽기 전용 모드 */
  readOnly?: boolean;
};

export default function WeekScheduleGrid({
  days,
  shifts,
  employees,
  onDayCreate,
  onShiftClick,
  readOnly = false, // ⭐️ 사장페이지는 기본 false, 직원페이지는 true 로 넘김
}: WeekScheduleGridProps) {
  // 🔥 날짜 하루 밀림 방지용
  const getDateStr = (d: Date) => {
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
  };

  // 🔥 직원별 색상 고정 (employeeId 기반)
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

  // 날짜별 근무 데이터
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
    <div className="border rounded-lg overflow-hidden">
      {/* 요일 헤더 */}
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
                isSun && "bg-red-100 text-red-700",
              )}
            >
              <div className="font-semibold">
                {format(d, "EEE", { locale: ko })}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {format(d, "MM/dd")}
              </div>
            </div>
          );
        })}
      </div>

      {/* 날짜 셀 */}
      <div className="grid grid-cols-7 min-h-[240px] text-xs sm:text-sm">
        {days.map((d, idx) => {
          const dateStr = getDateStr(d);
          const dayShifts = dayShiftsMap[dateStr] ?? [];
          const isSat = idx === 5;
          const isSun = idx === 6;

          return (
            <div
              key={dateStr}
              className={cn(
                "border-t border-r last:border-r-0 p-1 sm:p-2 flex flex-col gap-1",
                isSat && "bg-blue-50",
                isSun && "bg-red-50",
              )}
            >
              {/* 날짜 + (옵션) 근무 추가 버튼 */}
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] text-muted-foreground">
                  {format(d, "d일", { locale: ko })}
                </span>

                {/* ✅ 직원페이지에서는 readOnly=true 로 넘기니까 이 버튼이 렌더 안됨 */}
                {!readOnly && (
                  <button
                    type="button"
                    className="text-[11px] text-primary hover:underline"
                    onClick={() => onDayCreate(dateStr)}
                  >
                    + 근무 추가
                  </button>
                )}
              </div>

              {/* 근무 목록 */}
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                {dayShifts.map((s) => {
                  const emp = employeeMap.get(s.employeeId);
                  const label =
                    emp?.name ?? s.employeeName ?? `직원#${s.employeeId}`;
                  const empColor = getEmpColor(s.employeeId);

                  return (
                    <div
                      key={s.shiftId}
                      className={cn(
                        "cursor-pointer rounded border px-1 py-0.5 text-[11px] leading-tight hover:opacity-80",
                        empColor,
                      )}
                      onClick={() => {
                        if (!readOnly) onShiftClick?.(s);
                      }}
                    >
                      <div className="font-semibold truncate">{label}</div>
                      <div className="text-[10px]">
                        {s.startTime} ~ {s.endTime}
                        {s.breakMinutes ? ` (휴게 ${s.breakMinutes}분)` : ""}
                      </div>
                    </div>
                  );
                })}

                {dayShifts.length === 0 && (
                  <div className="text-[11px] text-muted-foreground">
                    근무 없음
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}