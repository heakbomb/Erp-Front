// modules/attendanceC/AttendanceDesktop.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Loader2,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Calendar as CalIcon,
} from "lucide-react";

import { useAttendance } from "./useAttendance";
import { attendanceApi } from "./attendanceApi";
import type { Employee, EmployeeShift } from "./attendanceTypes";
import WeekScheduleGrid from "./WeekScheduleGrid";
import MonthScheduleGrid from "./MonthScheduleGrid";

/* --- 날짜 유틸 --- */
function toDateOnlyString(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function startOfWeek(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay(); 
  const diff = (day + 6) % 7; 
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

export default function AttendanceDesktop() {
  // features 로직 그대로 훅 사용
  const {
    employeeId,
    storeId,
    recent,
    loadingRecent,
    page,
    totalPages,
    pagedRecent,
    setEmployeeId,
    setStoreId,
    loadRecent,
    setPage,
  } = useAttendance();

  // 1. 근무시간표(주간/월간) 조회용 로직 (features/AttendanceDesktopView 내부 로직 이식)
  const [mode, setMode] = useState<"WEEK" | "MONTH">("WEEK");
  const [anchorDate, setAnchorDate] = useState<Date>(startOfWeek(new Date()));
  const [scheduleShifts, setScheduleShifts] = useState<EmployeeShift[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

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

      // 달력 채우기
      const firstWeekStart = startOfWeek(start);
      const dates: Date[] = [];
      for (
        let d = new Date(firstWeekStart);
        ;
        d = addDays(d, 1)
      ) {
        dates.push(new Date(d));
        if (
          d.getFullYear() === end.getFullYear() &&
          d.getMonth() === end.getMonth() &&
          d.getDate() === end.getDate() &&
          d.getDay() === 0
        ) {
          break;
        }
        if (dates.length >= 42) break;
      }
      return {
        rangeLabel: `${toDateOnlyString(start)} ~ ${toDateOnlyString(end)}`,
        weekDays: [] as Date[],
        monthDates: dates,
      };
    }
  }, [mode, anchorDate]);

  // 근무시간표 조회 API 호출
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
    attendanceApi.fetchShifts({
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

  // 직원 목록 생성 (근무표 기반)
  const scheduleEmployees: Employee[] = useMemo(() => {
    const map = new Map<number, Employee>();
    scheduleShifts.forEach((s) => {
      if (!s.employeeId) return;
      if (map.has(s.employeeId)) return;
      map.set(s.employeeId, {
        employeeId: s.employeeId,
        name: s.employeeName ?? `직원#${s.employeeId}`,
      });
    });
    const arr = Array.from(map.values());
    arr.sort((a, b) => a.employeeId - b.employeeId);
    return arr;
  }, [scheduleShifts]);

  // 날짜 이동 핸들러
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

  return (
    <div className="space-y-6">
      {/* 1. 헤더 */}
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
            onChange={(e) => setEmployeeId(e.target.value.replace(/[^0-9]/g, ""))}
          />
          <Input
            inputMode="numeric"
            placeholder="사업장 ID"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value.replace(/[^0-9]/g, ""))}
          />
        </div>
      </div>

      <div className="grid gap-6">
        {/* 2. 근무 시간표 카드 */}
        <Card className="order-1 md:order-none employee-readonly-schedule">
          <CardHeader className="pb-2">
            <CardTitle>근무 시간표</CardTitle>
            <CardDescription>
              연/월을 선택해서 이번 주 또는 한 달 근무 스케줄을 조회할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 w-full">
            {/* 탭 및 컨트롤 */}
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
                <Button variant="outline" className="flex items-center gap-2" disabled>
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

            {/* 그리드 렌더링 */}
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
                onDayCreate={() => {}}
                onShiftClick={() => {}}
                readOnly // 직원 페이지이므로 읽기 전용
              />
            ) : (
              <MonthScheduleGrid
                dates={monthDates}
                shifts={scheduleShifts}
                employees={scheduleEmployees}
                onDayCreate={() => {}}
                onShiftClick={() => {}}
                readOnly
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. 최근 출퇴근 기록 카드 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>최근 출퇴근 기록</CardTitle>
            <CardDescription>최대 30건, 페이지당 10건</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadRecent()}
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
            <div className="text-sm text-muted-foreground">기록이 없습니다.</div>
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
                    <Badge variant={r.recordType === "IN" ? "default" : "secondary"}>
                      {r.recordType === "IN" ? "출근" : "퇴근"}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
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
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                >
                  다음
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 스타일 오버라이드 (근무추가 버튼 숨김 안전장치) */}
      <style jsx global>{`
        .employee-readonly-schedule .text-[11px].text-primary.hover\:underline {
          display: none;
        }
      `}</style>
    </div>
  );
}