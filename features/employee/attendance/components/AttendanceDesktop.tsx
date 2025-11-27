"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Calendar as CalIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

import { AttendanceItem } from "@/features/employee/attendance/services/attendanceService";

// 근무시간표 조회용 (사장페이지와 동일 API 사용)
import type { Employee, EmployeeShift } from "@/lib/types/database";
import { fetchShifts } from "@/features/owner/shifts/services/employeeShiftService";
import WeekScheduleGrid from "@/features/owner/shifts/components/WeekScheduleGrid";
import MonthScheduleGrid from "@/features/owner/shifts/components/MonthScheduleGrid";

/** 날짜 → yyyy-MM-dd (로컬 기준) */
const ymdLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const isoDate = (d: Date) => ymdLocal(d);

/** 주간/월간 근무시간표 계산용 헬퍼들 */
function toDateOnlyString(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function startOfWeek(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay(); // 0(일) ~ 6(토)
  const diff = (day + 6) % 7; // 월요일 기준
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  date.setDate(date.getDate() + n);
  return date;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

type AttendanceDesktopViewProps = {
  // 상태
  employeeId: string;
  storeId: string;
  date: Date | undefined;
  visibleMonth: Date;
  ymOpen: boolean;
  recent: AttendanceItem[];
  daily: AttendanceItem[];
  loadingRecent: boolean;
  loadingDay: boolean;
  punching: "IN" | "OUT" | null;
  page: number;
  totalPages: number;
  pagedRecent: AttendanceItem[];
  modifiers: any;
  dayHasIn: boolean;
  dayHasOut: boolean;

  // setter & actions
  setEmployeeIdAction: (v: string) => void;
  setStoreIdAction: (v: string) => void;
  setDateAction: (d: Date | undefined) => void;
  setVisibleMonthAction: (d: Date) => void;
  setYmOpenAction: (b: boolean) => void;
  setPageAction: (n: number) => void;
  loadRecentAction: () => void;
  punchAction: (k: "IN" | "OUT") => void;
  loadDayAction: (d: Date) => void;
};

export function AttendanceDesktopView({
  // 상태
  employeeId,
  storeId,
  date,
  visibleMonth,
  ymOpen, // eslint-disable-line @typescript-eslint/no-unused-vars
  recent,
  daily,
  loadingRecent,
  loadingDay,
  punching, // eslint-disable-line @typescript-eslint/no-unused-vars
  page,
  totalPages,
  pagedRecent,
  modifiers, // eslint-disable-line @typescript-eslint/no-unused-vars
  dayHasIn, // eslint-disable-line @typescript-eslint/no-unused-vars
  dayHasOut, // eslint-disable-line @typescript-eslint/no-unused-vars
  // 액션
  setEmployeeIdAction,
  setStoreIdAction,
  setDateAction,
  setVisibleMonthAction,
  setYmOpenAction, // eslint-disable-line @typescript-eslint/no-unused-vars
  setPageAction,
  loadRecentAction,
  punchAction, // eslint-disable-line @typescript-eslint/no-unused-vars
  loadDayAction,
}: AttendanceDesktopViewProps) {
  // ─────────────────────────────────────────
  // 1. 직원 근무시간표(주간/월간) 조회용 상태
  // ─────────────────────────────────────────
  const [mode, setMode] = useState<"WEEK" | "MONTH">("WEEK");
  const [anchorDate, setAnchorDate] = useState<Date>(startOfWeek(new Date()));
  const [scheduleShifts, setScheduleShifts] = useState<EmployeeShift[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // visibleMonth 와 anchorDate 싱크 (기존 상태 유지용)
  useEffect(() => {
    if (visibleMonth) {
      setAnchorDate(startOfWeek(visibleMonth));
    }
  }, [visibleMonth]);

  // 주간/월간 범위 계산
  const { rangeLabel, weekDays, monthDates } = useMemo(() => {
    if (mode === "WEEK") {
      const start = startOfWeek(anchorDate);
      const end = addDays(start, 6);
      const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
      return {
        rangeLabel: `${toDateOnlyString(start)} ~ ${toDateOnlyString(end)}`,
        weekDays: days,
        monthDates: [] as Date[],
      };
    } else {
      const start = startOfMonth(anchorDate);
      const end = endOfMonth(anchorDate);

      // 달력용 날짜 (앞뒤 공백 포함)
      const firstWeekStart = startOfWeek(start);
      const dates: Date[] = [];

      for (
        let d = new Date(
          firstWeekStart.getFullYear(),
          firstWeekStart.getMonth(),
          firstWeekStart.getDate()
        );
        ;
        d = addDays(d, 1)
      ) {
        dates.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));

        // 해당 달의 마지막 날(일요일)까지 채우기
        if (
          d.getFullYear() === end.getFullYear() &&
          d.getMonth() === end.getMonth() &&
          d.getDate() === end.getDate() &&
          d.getDay() === 0
        ) {
          break;
        }

        if (dates.length >= 42) break; // 6주 * 7일 안전장치
      }

      return {
        rangeLabel: `${toDateOnlyString(start)} ~ ${toDateOnlyString(end)}`,
        weekDays: [] as Date[],
        monthDates: dates,
      };
    }
  }, [mode, anchorDate]);

  // ─────────────────────────────────────────
  // 2. 근무시간표 데이터 조회 (사장페이지와 동일 API)
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!storeId) {
      setScheduleShifts([]);
      return;
    }

    const storeIdNum = Number(storeId);
    if (!storeIdNum) {
      setScheduleShifts([]);
      return;
    }

    const monthStart = startOfMonth(anchorDate);
    const fromStr = toDateOnlyString(monthStart);

    setScheduleLoading(true);
    fetchShifts({
      storeId: storeIdNum,
      from: fromStr,
      to: fromStr,
    })
      .then((data) => {
        setScheduleShifts(data ?? []);
      })
      .catch((e) => {
        console.error("직원 근무시간표 조회 실패:", e);
        setScheduleShifts([]);
      })
      .finally(() => setScheduleLoading(false));
  }, [storeId, anchorDate, mode]);

  // 직원별 색상/라벨용 Employee 리스트 (employeeId 기준 정렬로 색상 고정)
  const scheduleEmployees: Employee[] = useMemo(() => {
    const map = new Map<number, Employee>();

    scheduleShifts.forEach((s) => {
      if (!s.employeeId) return;
      if (map.has(s.employeeId)) return;

      const emp: Employee = {
        employeeId: s.employeeId,
        name: s.employeeName ?? `직원#${s.employeeId}`,
        email: "",
        phone: "",
        provider: "",
        provider_id: "",
        createdAt: "",
      };

      map.set(s.employeeId, emp);
    });

    const arr = Array.from(map.values());
    // 🔥 직원 ID 기준 정렬 → 주간/월간/사장페이지와 색상 매핑이 안정적으로 동일
    arr.sort((a, b) => a.employeeId - b.employeeId);
    return arr;
  }, [scheduleShifts]);

  const handlePrev = () => {
    setAnchorDate((prev) =>
      mode === "WEEK"
        ? addDays(prev, -7)
        : new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNext = () => {
    setAnchorDate((prev) =>
      mode === "WEEK"
        ? addDays(prev, 7)
        : new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const handleToday = () => {
    setAnchorDate(startOfWeek(new Date()));
  };

  // ─────────────────────────────────────────
  // 3. 화면 렌더링
  // ─────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">근태 관리</h1>
        <p className="text-muted-foreground">
          주간 근무 시간표와 출퇴근 기록을 함께 확인할 수 있습니다.
        </p>

        <div className="grid grid-cols-2 gap-2 sm:max-w-md">
          <Input
            inputMode="numeric"
            placeholder="직원 ID"
            value={employeeId}
            onChange={(e) =>
              setEmployeeIdAction(e.target.value.replace(/[^0-9]/g, ""))
            }
          />
          <Input
            inputMode="numeric"
            placeholder="사업장 ID"
            value={storeId}
            onChange={(e) =>
              setStoreIdAction(e.target.value.replace(/[^0-9]/g, ""))
            }
          />
        </div>
      </div>

      {/* 근무 시간표 전체 폭 사용 */}
      <div className="grid gap-6">
        {/* 왼쪽: 근무 시간표 (직원 화면에서는 이 카드만 사용) */}
        <Card className="order-1 md:order-none employee-readonly-schedule">
          <CardHeader className="pb-2">
            <CardTitle>근무 시간표</CardTitle>
            <CardDescription>
              연/월을 선택해서 이번 주 또는 한 달 근무 스케줄을 조회할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 w-full">
            {/* 상단 탭 + 날짜 네비게이션 */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={mode === "WEEK" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("WEEK")}
                >
                  주간 보기
                </Button>
                <Button
                  variant={mode === "MONTH" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("MONTH")}
                >
                  월간 보기
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrev}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled
                >
                  <CalIcon className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">{rangeLabel}</span>
                </Button>
                <Button variant="outline" size="icon" onClick={handleNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleToday}>
                  오늘
                </Button>
              </div>
            </div>

            {/* 근무표 그리드 */}
            {scheduleLoading ? (
              <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                근무 시간표를 불러오는 중…
              </div>
            ) : mode === "WEEK" ? (
              <WeekScheduleGrid
                days={weekDays}
                shifts={scheduleShifts}
                employees={scheduleEmployees}
                onDayCreate={() => {
                  /* 직원 화면에서는 생성 X */
                }}
                onShiftClick={() => {
                  /* 직원 화면에서는 수정/삭제 X */
                }}
                readOnly // 직원용: 조회만
              />
            ) : (
              <MonthScheduleGrid
                dates={monthDates}
                shifts={scheduleShifts}
                employees={scheduleEmployees}
                onDayCreate={() => {
                  /* 생성 X */
                }}
                onShiftClick={() => {
                  /* 수정 X */
                }}
                readOnly // 직원용: 조회만
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* 최근 출퇴근 기록 + 새로고침 버튼 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>최근 출퇴근 기록</CardTitle>
            <CardDescription>최대 30건, 페이지당 10건</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              loadRecentAction();
              if (date) loadDayAction(date);
            }}
            className="text-xs"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            출퇴근 기록 새로고침
          </Button>
        </CardHeader>
        <CardContent>
          {loadingRecent ? (
            <div className="text-sm text-muted-foreground">불러오는 중…</div>
          ) : recent.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              기록이 없습니다.
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {pagedRecent.map((r) => (
                  <div
                    key={r.logId}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          {r.recordTime.slice(0, 10)}
                        </p>
                      </div>
                      <div className="h-8 w-px bg-border" />
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(r.recordTime).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.clientIp ?? ""}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={r.recordType === "IN" ? "default" : "secondary"}
                    >
                      {r.recordType === "IN" ? "출근" : "퇴근"}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* 페이지 네비 */}
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageAction(Math.max(1, page - 1))}
                  disabled={page <= 1}
                >
                  이전
                </Button>
                <div className="text-sm text-muted-foreground">
                  {page} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPageAction(Math.min(totalPages, page + 1))
                  }
                  disabled={page >= totalPages}
                >
                  다음
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 직원페이지 전용: 근무추가 버튼 숨기기 */}
      <style jsx global>{`
        .employee-readonly-schedule .text-[11px].text-primary.hover\:underline {
          display: none;
        }
      `}</style>
    </div>
  );
}