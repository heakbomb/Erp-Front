// features/owner/shifts/components/MonthScheduleGrid.tsx
"use client";

import { format, isSameMonth } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";

import type { Employee, EmployeeShift } from "@/shared/types/database";

export type MonthScheduleGridProps = {
  dates: Date[];
  shifts: EmployeeShift[];
  employees: Employee[];
  onDayCreate: (dateStr: string) => void;
  onShiftClick?: (shift: EmployeeShift) => void;
  /** ✅ 직원페이지용 읽기 전용 모드 */
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
  // 🔥 날짜 하루 밀림 해결
  const getDateStr = (d: Date) => {
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
  };

  // 🔥 직원별 고정 색상 (employeeId 기반으로 항상 동일)
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

  // 날짜별 맵
  const shiftMap: Record<string, EmployeeShift[]> = {};
  shifts.forEach((s) => {
    if (!s.shiftDate) return;
    if (!shiftMap[s.shiftDate]) shiftMap[s.shiftDate] = [];
    shiftMap[s.shiftDate].push(s);
  });

  const employeeMap = new Map<number, Employee>();
  employees.forEach((e) => employeeMap.set(e.employeeId, e));

  if (!dates.length) {
    return (
      <p className="text-sm text-muted-foreground">표시할 날짜가 없습니다.</p>
    );
  }

  const currentMonth = dates[15]?.getMonth() ?? new Date().getMonth();

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 bg-muted text-xs sm:text-sm">
        {["월", "화", "수", "목", "금", "토", "일"].map((label, idx) => {
          const isSat = idx === 5;
          const isSun = idx === 6;
          return (
            <div
              key={label}
              className={cn(
                "px-2 py-2 text-center border-b",
                isSat && "bg-blue-100 text-blue-700",
                isSun && "bg-red-100 text-red-700",
              )}
            >
              {label}
            </div>
          );
        })}
      </div>

      {/* 날짜 셀 */}
      <div className="grid grid-cols-7 text-xs sm:text-sm">
        {dates.map((d, idx) => {
          const dateStr = getDateStr(d);
          const dayShifts = shiftMap[dateStr] ?? [];

          const isOtherMonth = !isSameMonth(
            d,
            new Date(d.getFullYear(), currentMonth, 1),
          );
          const isSat = idx % 7 === 5;
          const isSun = idx % 7 === 6;

          return (
            <div
              key={dateStr + idx}
              className={cn(
                "border-t border-r last:border-r-0 min-h-[100px] p-1 flex flex-col gap-1",
                isOtherMonth && "bg-muted/40 text-muted-foreground",
                isSat && "bg-blue-50",
                isSun && "bg-red-50",
              )}
            >
              {/* 날짜 + (옵션) 근무 추가 버튼 */}
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px]">
                  {format(d, "d일", { locale: ko })}
                </span>

                {/* ✅ 직원페이지에서는 readOnly=true 이라서 + 버튼 안 나옴 */}
                {!readOnly && (
                  <button
                    className="text-[11px] text-primary hover:underline"
                    onClick={() => onDayCreate(dateStr)}
                  >
                    +
                  </button>
                )}
              </div>

              {/* 근무 목록 */}
              <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
                {dayShifts.map((s) => {
                  const emp = employeeMap.get(s.employeeId);
                  const label =
                    emp?.name ?? s.employeeName ?? `직원 #${s.employeeId}`;
                  const empColor = getEmpColor(s.employeeId);

                  return (
                    <div
                      key={s.shiftId}
                      className={cn(
                        "cursor-pointer rounded border px-1 py-0.5 text-[11px] hover:opacity-80",
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