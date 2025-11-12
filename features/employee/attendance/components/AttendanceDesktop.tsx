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
import { Calendar } from "@/components/ui/calendar";
import {
  Loader2,
  LogIn,
  LogOut,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Calendar as CalIcon,
} from "lucide-react";
import { useMemo, useRef, useEffect } from "react";
import { AttendanceItem } from "@/features/employee/attendance/services/attendanceService";

const ymdLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const isoDate = (d: Date) => ymdLocal(d);

const fmtTime = (iso: string) => {
  const dt = new Date(iso);
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  const ss = String(dt.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

// ───────── 연/월 선택 팝업 ─────────
function YMPicker({
  anchorYear,
  selectedYear,
  selectedMonth,
  onSelect,
  onClose,
}: {
  anchorYear: number;
  selectedYear: number;
  selectedMonth: number;
  onSelect: (y: number, m: number) => void;
  onClose: () => void;
}) {
  const years = useMemo(() => {
    const start = anchorYear - 40;
    const end = anchorYear + 40;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [anchorYear]);

  const months = Array.from({ length: 12 }, (_, i) => i);
  const yearListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = yearListRef.current;
    if (!el) return;
    const idx = years.indexOf(selectedYear);
    if (idx >= 0) {
      const rowH = 36;
      el.scrollTop = Math.max(0, idx * rowH - 6 * rowH);
    }
  }, [years, selectedYear]);

  return (
    <div className="absolute left-1/2 top-12 z-50 w-[300px] -translate-x-1/2 rounded-xl border bg-background shadow-lg">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <CalIcon className="h-4 w-4" />
          <span className="text-sm font-medium">연/월 빠른 선택</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          닫기
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3">
        <div className="max-h-64 overflow-y-auto pr-1" ref={yearListRef}>
          {years.map((y) => (
            <button
              key={y}
              onClick={() => onSelect(y, selectedMonth)}
              className={`w-full h-9 px-2 rounded-md text-left text-sm ${
                y === selectedYear
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              {y}년
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {months.map((m) => (
            <button
              key={m}
              onClick={() => onSelect(selectedYear, m)}
              className={`h-9 rounded-md text-sm ${
                m === selectedMonth
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              {m + 1}월
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ───────── 실제 화면 ─────────
export function AttendanceDesktopView({
  // 상태
  employeeId,
  storeId,
  date,
  visibleMonth,
  ymOpen,
  recent,
  daily,
  loadingRecent,
  loadingDay,
  punching,
  page,
  totalPages,
  pagedRecent,
  modifiers,
  dayHasIn,
  dayHasOut,
  // setter & actions  ⬅️ 이름만 ...Action 으로 변경
  setEmployeeIdAction,
  setStoreIdAction,
  setDateAction,
  setVisibleMonthAction,
  setYmOpenAction,
  setPageAction,
  loadRecentAction,
  punchAction,
  loadDayAction,
}: {
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
  setEmployeeIdAction: (v: string) => void;
  setStoreIdAction: (v: string) => void;
  setDateAction: (d: Date | undefined) => void;
  setVisibleMonthAction: (d: Date) => void;
  setYmOpenAction: (b: boolean) => void;
  setPageAction: (n: number) => void;
  loadRecentAction: () => void;
  punchAction: (k: "IN" | "OUT") => void;
  loadDayAction: (d: Date) => void;
}) {
  const currentY = visibleMonth.getFullYear();
  const currentM = visibleMonth.getMonth();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">근태 관리</h1>
        <p className="text-muted-foreground">
          달력 위 연/월 선택 패널로 빠르게 이동하세요
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* 캘린더 */}
        <Card className="order-1 md:order-none">
          <CardHeader className="pb-2">
            <CardTitle>근무 달력</CardTitle>
            <CardDescription>연/월 선택 및 일자별 기록 확인</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 w-full">
            {/* 달력 컨트롤바 */}
            <div className="relative w-full flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  setVisibleMonthAction(new Date(currentY, Math.max(0, currentM - 1), 1))
                }
                aria-label="이전 달"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                onClick={() => setYmOpenAction(!ymOpen)}
                className="inline-flex items-center gap-2"
                aria-label="연월 선택"
                variant="outline"
              >
                <CalIcon className="h-4 w-4" />
                <span>
                  {currentY}년 {currentM + 1}월
                </span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  setVisibleMonthAction(new Date(currentY, Math.min(11, currentM + 1), 1))
                }
                aria-label="다음 달"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {ymOpen && (
                <YMPicker
                  anchorYear={currentY}
                  selectedYear={currentY}
                  selectedMonth={currentM}
                  onSelect={(yy, mm) => {
                    setVisibleMonthAction(new Date(yy, mm, 1));
                    setYmOpenAction(false);
                  }}
                  onClose={() => setYmOpenAction(false)}
                />
              )}
            </div>

            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDateAction(d)}
              month={visibleMonth}
              onMonthChange={(m) => setVisibleMonthAction(m)}
              className="rounded-md border w-full sm:w-auto"
              showOutsideDays
              modifiers={modifiers as any}
              modifiersClassNames={{ hasRecord: "has-record" } as any}
            />

            {/* 출근/퇴근 버튼 */}
            <div className="grid grid-cols-2 gap-2 w-full sm:max-w-sm">
              <Button
                className="h-12 text-base"
                onClick={() => punchAction("IN")}
                disabled={punching !== null}
              >
                {punching === "IN" ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-5 w-5" />
                )}
                출근
              </Button>
              <Button
                variant="outline"
                className="h-12 text-base"
                onClick={() => punchAction("OUT")}
                disabled={punching !== null}
              >
                {punching === "OUT" ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-5 w-5" />
                )}
                퇴근
              </Button>
            </div>

            <div className="w-full p-3 rounded-lg bg-muted flex items-center justify-between">
              <p className="text-sm font-medium">
                선택일: {date ? ymdLocal(date) : "-"}
              </p>
              <div className="flex gap-2">
                <Badge variant={dayHasIn ? "default" : "outline"}>
                  출근 {dayHasIn ? "있음" : "없음"}
                </Badge>
                <Badge variant={dayHasOut ? "default" : "outline"}>
                  퇴근 {dayHasOut ? "있음" : "없음"}
                </Badge>
              </div>
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
              새로고침
            </Button>
          </CardContent>
        </Card>

        {/* 오른쪽 카드 (그대로) */}
        <Card>
          <CardHeader>
            <CardTitle>이번 달 요약</CardTitle>
            <CardDescription>
              {new Date().getFullYear()}년 {new Date().getMonth() + 1}월
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">총 근무일</p>
                <p className="text-2xl font-bold mt-1">18일</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">총 근무시간</p>
                <p className="text-2xl font-bold mt-1">144시간</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">지각</p>
                <p className="text-2xl font-bold mt-1">1회</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">조퇴</p>
                <p className="text-2xl font-bold mt-1">1회</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">예상 급여</p>
              <p className="text-3xl font-bold">₩1,440,000</p>
              <p className="text-xs text-muted-foreground mt-1">시급 ₩10,000 기준</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 출퇴근 기록 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 출퇴근 기록</CardTitle>
          <CardDescription>최대 30건, 페이지당 10건</CardDescription>
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
                        <p className="text-sm font-medium">{fmtTime(r.recordTime)}</p>
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
                  onClick={() => setPageAction(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                >
                  다음
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 선택 날짜 자세히 */}
      <Card>
        <CardHeader>
          <CardTitle>선택일 상세 기록</CardTitle>
          <CardDescription>{date ? isoDate(date) : "-"}</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingDay ? (
            <div className="text-sm text-muted-foreground">불러오는 중…</div>
          ) : daily.length === 0 ? (
            <div className="text-sm text-muted-foreground">해당 일자의 기록이 없습니다.</div>
          ) : (
            <div className="space-y-2">
              {daily.map((r) => (
                <div
                  key={r.logId}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm font-medium">{fmtTime(r.recordTime)}</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-xs text-muted-foreground">
                      {r.clientIp ?? ""}
                    </div>
                  </div>
                  <Badge variant={r.recordType === "IN" ? "default" : "secondary"}>
                    {r.recordType === "IN" ? "출근" : "퇴근"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 달력 점 표시용 CSS */}
      <style jsx global>{`
        .rdp-day.has-record {
          position: relative;
        }
        .rdp-day.has-record::after {
          content: "";
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: currentColor;
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
}