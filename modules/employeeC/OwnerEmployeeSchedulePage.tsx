"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
} from "date-fns";
import { Loader2, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

import { useStore } from "@/contexts/StoreContext";
import useEmployeeList from "./useEmployeeList";
import { attendanceApi } from "@/modules/attendanceC/attendanceApi";
import type {
  EmployeeShift,
  Employee as AttendanceEmployee,
} from "@/modules/attendanceC/attendanceTypes";
import WeekScheduleGrid from "@/modules/attendanceC/WeekScheduleGrid";
import MonthScheduleGrid from "@/modules/attendanceC/MonthScheduleGrid";

import ShiftCreateModal, {
  type ShiftFormValues,
} from "@/modules/attendanceC/ShiftCreateModal";
import BulkShiftCreateModal, {
  type BulkShiftFormValues,
} from "@/modules/attendanceC/BulkShiftCreateModal";

import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";
import { cn } from "@/shared/utils/commonUtils";

const toDateOnlyString = (d: Date) => format(d, "yyyy-MM-dd");

/** ---- 시간/날짜 유틸 (표시/매칭 전용) ---- */
const normalizeTime = (t: string) => {
  if (!t) return t;
  if (t.length === 5) return `${t}:00`;
  if (t.length >= 8) return t.slice(0, 8);
  return t;
};

const isEndOfDay = (t: string) => normalizeTime(t) === "23:59:59";
const isMidnight = (t: string) => normalizeTime(t) === "00:00:00";

const plusDaysYmd = (ymd: string, days: number) => {
  const d = new Date(`${ymd}T00:00:00`);
  d.setDate(d.getDate() + days);
  return format(d, "yyyy-MM-dd");
};

/**
 * ✅ 야간 분할(2행)을 "시작일 1장 + 다음날 이어짐 1장"으로 만든다.
 * - 시작일 카드: 클릭 가능(수정/삭제 대상), isNight=true, groupShiftIds 보유
 * - 다음날 카드: 클릭 불가 표시용, isNightContinue=true
 */
function mergeNightSplitShiftsWithContinuation(raw: EmployeeShift[]): EmployeeShift[] {
  if (!raw?.length) return [];

  const unique = Array.from(new Map(raw.map((s) => [s.shiftId, s])).values());

  // key: store|emp|date|start
  const byKey = new Map<string, EmployeeShift>();
  unique.forEach((s) => {
    const key = `${s.storeId}|${s.employeeId}|${s.shiftDate}|${normalizeTime(
      s.startTime
    )}`;
    byKey.set(key, s);
  });

  const used = new Set<number>();
  const result: EmployeeShift[] = [];

  for (const s of unique) {
    if (used.has(s.shiftId)) continue;

    const startTime = normalizeTime(s.startTime);
    const endTime = normalizeTime(s.endTime);

    // 첫째날 조각: start~23:59:59
    if (isEndOfDay(endTime) && !isMidnight(startTime)) {
      const nextDate = plusDaysYmd(s.shiftDate, 1);
      const secondKey = `${s.storeId}|${s.employeeId}|${nextDate}|00:00:00`;
      const second = byKey.get(secondKey);

      if (second && !used.has(second.shiftId)) {
        used.add(s.shiftId);
        used.add(second.shiftId);

        const mergedStartCard: any = {
          ...s, // ✅ 시작일 셀에 표시
          startTime,
          endTime: normalizeTime(second.endTime),
          isNight: true,
          groupShiftIds: [s.shiftId, second.shiftId],
          nightStartDate: s.shiftDate,
          nightSecondDate: second.shiftDate,
          isFixed: Boolean(s.isFixed || second.isFixed),
          breakMinutes: (s.breakMinutes ?? 0) || (second.breakMinutes ?? 0),
        };

        const continueCard: any = {
          ...second,
          startTime,
          endTime: normalizeTime(second.endTime),
          isNight: true,
          isNightContinue: true,
        };

        result.push(mergedStartCard);
        result.push(continueCard);
        continue;
      }
    }

    used.add(s.shiftId);
    result.push({
      ...s,
      startTime,
      endTime,
    });
  }

  return result;
}

export default function OwnerEmployeeSchedulePage() {
  const { currentStoreId } = useStore();
  const { employees } = useEmployeeList();

  const [mode, setMode] = useState<"WEEK" | "MONTH">("WEEK");
  const [anchorDate, setAnchorDate] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [shifts, setShifts] = useState<EmployeeShift[]>([]);
  const [loading, setLoading] = useState(false);

  // 모달 상태
  const [isSingleOpen, setIsSingleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<EmployeeShift | null>(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const scheduleEmployees: AttendanceEmployee[] = useMemo(() => {
    return (employees ?? []).map((e: any) => ({
      employeeId: Number(e.employeeId),
      name: (e?.name && String(e.name).trim()) || `직원#${Number(e.employeeId)}`,
      email: e?.email ?? undefined,
      phone: e?.phone ?? undefined,
    }));
  }, [employees]);

  const { rangeLabel, weekDays, monthDates } = useMemo(() => {
    if (mode === "WEEK") {
      const start = startOfWeek(anchorDate, { weekStartsOn: 0 });
      const end = endOfWeek(anchorDate, { weekStartsOn: 0 });
      const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
      return {
        rangeLabel: `${format(start, "yyyy-MM-dd")} ~ ${format(end, "yyyy-MM-dd")}`,
        weekDays: days,
        monthDates: [] as Date[],
      };
    } else {
      const start = startOfMonth(anchorDate);
      const end = endOfMonth(anchorDate);

      const startGrid = startOfWeek(start, { weekStartsOn: 0 });
      const endGrid = endOfWeek(end, { weekStartsOn: 0 });

      const dates: Date[] = [];
      let current = startGrid;
      while (current <= endGrid) {
        dates.push(current);
        current = addDays(current, 1);
      }

      return {
        rangeLabel: format(start, "yyyy-MM"),
        weekDays: [] as Date[],
        monthDates: dates,
      };
    }
  }, [mode, anchorDate]);

  const fetchShifts = async () => {
    if (!currentStoreId) return;
    setLoading(true);
    try {
      const from = toDateOnlyString(mode === "WEEK" ? weekDays[0] : monthDates[0]);
      const to = toDateOnlyString(
        mode === "WEEK" ? weekDays[6] : monthDates[monthDates.length - 1]
      );

      const data = await attendanceApi.fetchShifts({
        storeId: currentStoreId,
        from,
        to,
      });
      setShifts(data || []);
    } catch (e) {
      console.error(e);
      toast.error("스케줄 로드 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStoreId, anchorDate, mode]);

  // ✅ 화면 표시용(야간 병합 + 이어짐 표시)
  const displayShifts = useMemo(
    () => mergeNightSplitShiftsWithContinuation(shifts),
    [shifts]
  );

  const handleSingleSubmit = async (values: ShiftFormValues, shiftId?: number) => {
    if (!currentStoreId) return;

    if (values.startTime === values.endTime) {
      alert("시작/종료 시간이 같을 수 없습니다.");
      throw new Error("시작/종료 시간이 같을 수 없습니다.");
    }

    try {
      const anySel: any = selectedShift as any;

      /**
       * ✅ 핵심 수정:
       * 서버가 "야간(그룹) 단건 update"를 막는 경우가 있어서,
       * 야간 대표카드는 update(2번) 대신:
       *   - 기존 2건 삭제
       *   - createShift로 재등록(서버가 다시 2건 분할 저장)
       * 로 처리한다.
       *
       * UI/UX 변화 없음(사용자는 '수정'처럼 동작).
       */
      if (
        shiftId &&
        anySel?.groupShiftIds?.length === 2 &&
        anySel?.isNight &&
        !anySel?.isNightContinue
      ) {
        const [part1Id, part2Id] = anySel.groupShiftIds as [number, number];
        const startDate = anySel.nightStartDate as string; // 시작일 기준으로 재등록

        // 1) 기존 2건 삭제
        await attendanceApi.deleteShift(currentStoreId, part1Id);
        await attendanceApi.deleteShift(currentStoreId, part2Id);

        // 2) 재등록 (백엔드가 야간이면 2건 분할 저장)
        await attendanceApi.createShift({
          storeId: currentStoreId,
          employeeId: Number(values.employeeId),
          date: startDate,
          startTime: values.startTime,
          endTime: values.endTime,
          breakMinutes: values.breakMinutes ?? 0,
          isFixed: !!anySel.isFixed,
        });

        toast.success("수정되었습니다.");
        await fetchShifts();
        setIsSingleOpen(false);
        return;
      }

      // 일반(1건) 수정
      if (shiftId) {
        await attendanceApi.updateShift(currentStoreId, shiftId, {
          ...values,
          storeId: currentStoreId,
          employeeId: Number(values.employeeId),
        });
        toast.success("수정되었습니다.");
      } else {
        // 생성(야간이면 백엔드에서 2건 분할 저장)
        await attendanceApi.createShift({
          ...values,
          storeId: currentStoreId,
          employeeId: Number(values.employeeId),
        });
        toast.success("추가되었습니다.");
      }

      await fetchShifts();
      setIsSingleOpen(false);
    } catch (e: any) {
      const msg =
        e?.message ||
        e?.response?.data?.message ||
        (typeof e?.response?.data === "string" ? e.response.data : null);

      if (msg?.includes("중복")) {
        toast.error("이미 등록된 근무입니다.\n같은 날짜·시간·직원은 중복 등록할 수 없습니다.");
      } else {
        toast.error(msg || "저장 실패");
      }
      throw e;
    }
  };

  const handleSingleDelete = async (shiftId: number) => {
    if (!currentStoreId) return;
    if (!confirm("삭제하시겠습니까?")) return;

    try {
      const anySel: any = selectedShift as any;

      // 야간 대표카드만 묶음 삭제
      if (
        anySel?.groupShiftIds?.length === 2 &&
        anySel?.isNight &&
        !anySel?.isNightContinue
      ) {
        const [part1Id, part2Id] = anySel.groupShiftIds as [number, number];
        await attendanceApi.deleteShift(currentStoreId, part1Id);
        await attendanceApi.deleteShift(currentStoreId, part2Id);
        toast.success("삭제되었습니다.");
        await fetchShifts();
        setIsSingleOpen(false);
        return;
      }

      await attendanceApi.deleteShift(currentStoreId, shiftId);
      toast.success("삭제되었습니다.");
      await fetchShifts();
      setIsSingleOpen(false);
    } catch (e) {
      toast.error("삭제 실패");
    }
  };

  const handleSingleDeleteMonth = async (employeeId: number) => {
    if (!currentStoreId) return;
    if (!confirm("이 직원의 이번 달 근무를 모두 삭제하시겠습니까?")) return;
    try {
      const from = toDateOnlyString(startOfMonth(anchorDate));
      const to = toDateOnlyString(endOfMonth(anchorDate));
      await attendanceApi.deleteShiftRange({
        storeId: currentStoreId,
        employeeId,
        from,
        to,
      });
      toast.success("일괄 삭제되었습니다.");
      await fetchShifts();
      setIsSingleOpen(false);
    } catch (e) {
      toast.error("삭제 실패");
    }
  };

  // ✅✅✅ 여기만 요구사항 반영: "중복 탐지 → alert → 삭제 후 등록"
  const handleBulkSubmit = async (values: BulkShiftFormValues) => {
    if (!currentStoreId) return;

    if (values.startTime === values.endTime) {
      alert("시작/종료 시간이 같을 수 없습니다.");
      throw new Error("시작/종료 시간이 같을 수 없습니다.");
    }

    try {
      const employeeId = Number(values.employeeId);

      // 1) 현재 로드된 shifts에서 (직원+날짜) 기존 날짜 Set 구성
      const existingDates = new Set(
        (shifts ?? [])
          .filter((s) => Number(s.employeeId) === employeeId)
          .map((s) => (s.shiftDate?.length > 10 ? s.shiftDate.slice(0, 10) : s.shiftDate))
          .filter(Boolean)
      );

      // 2) 이번 등록 대상 중 중복 날짜 추출
      const dupDates = (values.dates ?? []).filter((d) => existingDates.has(d));
      const uniqueDupDates = Array.from(new Set(dupDates));

      // 3) 중복이 있으면 alert로 안내 후, 삭제 → 등록
      if (uniqueDupDates.length > 0) {
        // 너무 길면 앞부분만 보여주고 개수로 안내
        const preview = uniqueDupDates.slice(0, 10).join(", ");
        const more = uniqueDupDates.length > 10 ? ` 외 ${uniqueDupDates.length - 10}건` : "";
        alert(
          `중복 근무가 발견되었습니다.\n(직원: ${employeeId})\n중복 날짜: ${preview}${more}\n\n기존 근무를 삭제 후 다시 등록합니다.
           이 작업은 되돌릴수가 없습니다 진행하시겠습니까?`
        );

        // 날짜별로 "하루 범위" 삭제(from=to) → 해당 날짜의 기존 근무만 제거
        for (const ymd of uniqueDupDates) {
          await attendanceApi.deleteShiftRange({
            storeId: currentStoreId,
            employeeId,
            from: ymd,
            to: ymd,
          });
        }
      }

      // 4) 등록 진행
      await attendanceApi.createShiftBulk({
        storeId: currentStoreId,
        employeeId,
        dates: values.dates,
        startTime: values.startTime,
        endTime: values.endTime,
        breakMinutes: values.breakMinutes ?? 0,
        isFixed: !!values.isFixed,
      });

      toast.success(`${values.dates.length}건 등록 완료`);
      await fetchShifts();
      setIsBulkOpen(false);
    } catch (e: any) {
      const msg =
        e?.message ||
        e?.response?.data?.message ||
        (typeof e?.response?.data === "string" ? e.response.data : null);

      toast.error(msg || "일괄 등록 실패");
      throw e;
    }
  };

  const handleDayCreate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedShift(null);
    setIsSingleOpen(true);
  };

  const handleShiftClick = (shift: EmployeeShift) => {
    const anyShift: any = shift as any;
    if (anyShift?.isNightContinue) return;

    setSelectedDate(shift.shiftDate);
    setSelectedShift(shift);
    setIsSingleOpen(true);
  };

  const handlePrev = () =>
    setAnchorDate((prev) =>
      mode === "WEEK" ? addDays(prev, -7) : addDays(startOfMonth(prev), -1)
    );
  const handleNext = () =>
    setAnchorDate((prev) =>
      mode === "WEEK" ? addDays(prev, 7) : addDays(endOfMonth(prev), 1)
    );
  const handleToday = () => setAnchorDate(new Date());

  if (!currentStoreId)
    return <div className="p-8 text-center text-muted-foreground">매장을 선택해주세요.</div>;

  const employeeNames = scheduleEmployees.map((e) => e.name).join(", ");

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            직원 근무 시간표
          </h1>
          <p className="text-muted-foreground text-sm">
            주간 / 월간 근무표를 한눈에 확인하고, 사장님이 직접 스케줄을 설정할 수 있습니다.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            등록된 직원 ({scheduleEmployees.length}명): {employeeNames}
          </p>
        </div>

        <Link href="/owner/employees">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            직원 관리로 돌아가기
          </Button>
        </Link>
      </div>

      <Card className="border shadow-sm bg-white">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col items-start gap-2">
            <div className="text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-md border bg-white px-2 py-1 shadow-sm">
                <span aria-hidden>📌</span>
                <span>표시된 핀 아이콘은 “고정 근무 스케줄”입니다.</span>
              </span>
            </div>

            <div className="text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-md border bg-white px-2 py-1 shadow-sm">
                <span aria-hidden>🌙</span>
                <span>표시된 달 아이콘은 “야간 근무 스케줄(다음날까지 이어짐)”입니다.</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center bg-muted/20 p-1 rounded-lg border">
              <button
                onClick={() => setMode("WEEK")}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                  mode === "WEEK"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                주간 보기
              </button>
              <button
                onClick={() => setMode("MONTH")}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                  mode === "MONTH"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                월간 보기
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={handlePrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center justify-center min-w-[180px] h-9 px-3 border rounded-md bg-white">
                <span className="text-sm font-medium">{rangeLabel}</span>
              </div>

              <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button variant="ghost" className="h-9 px-3 font-normal" onClick={handleToday}>
                오늘
              </Button>

              <Button
                className="h-9 bg-[#1e293b] hover:bg-[#334155] text-white gap-2 ml-2"
                onClick={() => setIsBulkOpen(true)}
              >
                월간 근무 일괄 등록
              </Button>
            </div>
          </div>

          <div className="min-h-[500px] border-t pt-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                <p>스케줄을 불러오는 중입니다...</p>
              </div>
            ) : mode === "WEEK" ? (
              <WeekScheduleGrid
                days={weekDays}
                shifts={displayShifts}
                employees={scheduleEmployees}
                onDayCreate={handleDayCreate}
                onShiftClick={handleShiftClick}
                readOnly={false}
              />
            ) : (
              <MonthScheduleGrid
                dates={monthDates}
                shifts={displayShifts}
                employees={scheduleEmployees}
                onDayCreate={handleDayCreate}
                onShiftClick={handleShiftClick}
                readOnly={false}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <ShiftCreateModal
        open={isSingleOpen}
        onClose={() => setIsSingleOpen(false)}
        date={selectedDate}
        employees={scheduleEmployees as any}
        initialShift={selectedShift}
        onSubmit={handleSingleSubmit}
        onDelete={handleSingleDelete}
        onDeleteMonthAll={handleSingleDeleteMonth}
      />

      <BulkShiftCreateModal
        open={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        targetMonth={anchorDate}
        employees={scheduleEmployees as any}
        onSubmit={handleBulkSubmit}
      />
    </div>
  );
}