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
import type { EmployeeShift } from "@/modules/attendanceC/attendanceTypes";
// ✅ 그리드용 Employee 타입 (name 필수)
import type { Employee as GridEmployee } from "@/modules/attendanceC/attendanceTypes"; 

import WeekScheduleGrid from "@/modules/attendanceC/WeekScheduleGrid";
import MonthScheduleGrid from "@/modules/attendanceC/MonthScheduleGrid";

// 모달 컴포넌트
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

  // ✅ [핵심 수정] 그리드 컴포넌트용 직원 리스트 변환 (name 필수 보장)
  const gridEmployees: GridEmployee[] = useMemo(() => {
    return employees.map((emp) => ({
      employeeId: emp.employeeId,
      name: emp.name ?? "이름 없음", // name이 없으면 기본값 설정
      email: emp.email ?? null,
      phone: emp.phone ?? null,
    }));
  }, [employees]);

  // 날짜 계산
  const { rangeLabel, weekDays, monthDates } = useMemo(() => {
    if (mode === "WEEK") {
      const start = startOfWeek(anchorDate, { weekStartsOn: 0 });
      const end = endOfWeek(anchorDate, { weekStartsOn: 0 });
      const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
      return {
        rangeLabel: `${format(start, "yyyy-MM-dd")} ~ ${format(
          end,
          "yyyy-MM-dd"
        )}`,
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

  // 스케줄 조회
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

  // 단일 등록/수정
  const handleSingleSubmit = async (values: ShiftFormValues, shiftId?: number) => {
    if (!currentStoreId) return;
    try {
      if (shiftId) {
        await attendanceApi.updateShift(currentStoreId, shiftId, {
          ...values,
          storeId: currentStoreId,
          employeeId: Number(values.employeeId),
        });
        toast.success("수정되었습니다.");
      } else {
        await attendanceApi.createShift({
          ...values,
          storeId: currentStoreId,
          employeeId: Number(values.employeeId),
        });
        toast.success("추가되었습니다.");
      }
      fetchShifts();
      setIsSingleOpen(false);
    } catch (e: any) {
      const status = e?.response?.status;
      const message = e?.response?.data?.message;

      if (status === 409) {
        toast.error("이미 등록된 근무입니다.\n같은 날짜·시간·직원은 중복 등록할 수 없습니다.");
        return;
      }

      toast.error(message || "저장 실패");
    }
  };

  const handleSingleDelete = async (shiftId: number) => {
    if (!currentStoreId) return;
    try {
      await attendanceApi.deleteShift(currentStoreId, shiftId);
      toast.success("삭제되었습니다.");
      fetchShifts();
      setIsSingleOpen(false);
    } catch (e) {
      toast.error("삭제 실패");
    }
  };

  const handleSingleDeleteMonth = async (employeeId: number) => {
    if (!currentStoreId) return;
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
      fetchShifts();
      setIsSingleOpen(false);
    } catch (e) {
      toast.error("삭제 실패");
    }
  };

  const handleBulkSubmit = async (values: BulkShiftFormValues) => {
    if (!currentStoreId) return;

    let success = 0;
    let duplicated = 0;
    let fail = 0;

    await Promise.all(
      values.dates.map(async (date) => {
        try {
          await attendanceApi.createShift({
            storeId: currentStoreId,
            employeeId: Number(values.employeeId),
            date,
            startTime: values.startTime,
            endTime: values.endTime,
            breakMinutes: values.breakMinutes,
            isFixed: !!values.isFixed,
          });
          success++;
        } catch (e: any) {
          if (e?.response?.status === 409) duplicated++;
          else fail++;
        }
      })
    );

    if (success > 0) toast.success(`${success}건 등록 완료`);
    if (duplicated > 0) toast.message(`${duplicated}건은 이미 등록되어 건너뜀`);
    if (fail > 0) toast.error(`${fail}건 등록 실패`);

    if (success > 0) {
      fetchShifts();
      setIsBulkOpen(false);
    }
  };

  // UI 이벤트
  const handleDayCreate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedShift(null);
    setIsSingleOpen(true);
  };

  const handleShiftClick = (shift: EmployeeShift) => {
    setSelectedDate(shift.shiftDate);
    setSelectedShift(shift);
    setIsSingleOpen(true);
  };

  const handlePrev = () =>
    setAnchorDate((prev) =>
      mode === "WEEK"
        ? addDays(prev, -7)
        : addDays(startOfMonth(prev), -1)
    );
  const handleNext = () =>
    setAnchorDate((prev) =>
      mode === "WEEK"
        ? addDays(prev, 7)
        : addDays(endOfMonth(prev), 1)
    );
  const handleToday = () => setAnchorDate(new Date());

  if (!currentStoreId)
    return (
      <div className="p-8 text-center text-muted-foreground">
        매장을 선택해주세요.
      </div>
    );

  const employeeNames = employees.map((e) => e.name).join(", ");

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-[1400px] mx-auto">
      {/* 1. 페이지 헤더 */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            직원 근무 시간표
          </h1>
          <p className="text-muted-foreground text-sm">
            주간 / 월간 근무표를 한눈에 확인하고, 사장님이 직접 스케줄을 설정할 수 있습니다.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            등록된 직원 ({employees.length}명): {employeeNames}
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

      {/* 2. 메인 스케줄 카드 */}
      <Card className="border shadow-sm bg-white">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-md border bg-white px-2 py-1 shadow-sm">
                <span aria-hidden>📌</span>
                <span>표시된 핀 아이콘은 “고정 근무 스케줄”입니다.</span>
              </span>
            </div>
          </div>

          {/* 툴바 */}
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
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center justify-center min-w-[180px] h-9 px-3 border rounded-md bg-white">
                <span className="text-sm font-medium">{rangeLabel}</span>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={handleNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                className="h-9 px-3 font-normal"
                onClick={handleToday}
              >
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

          {/* 그리드 영역 */}
          <div className="min-h-[500px] border-t pt-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                <p>스케줄을 불러오는 중입니다...</p>
              </div>
            ) : mode === "WEEK" ? (
              <WeekScheduleGrid
                days={weekDays}
                shifts={shifts}
                employees={gridEmployees} // ✅ 변환된 직원 목록 전달
                onDayCreate={handleDayCreate}
                onShiftClick={handleShiftClick}
                readOnly={false}
              />
            ) : (
              <MonthScheduleGrid
                dates={monthDates}
                shifts={shifts}
                employees={gridEmployees} // ✅ 변환된 직원 목록 전달
                onDayCreate={handleDayCreate}
                onShiftClick={handleShiftClick}
                readOnly={false}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* 모달들 (모달은 employeeC 타입을 사용하므로 원래 리스트 전달) */}
      <ShiftCreateModal
        open={isSingleOpen}
        onClose={() => setIsSingleOpen(false)}
        date={selectedDate}
        employees={employees} // ✅ 원본 유지
        initialShift={selectedShift}
        onSubmit={handleSingleSubmit}
        onDelete={handleSingleDelete}
        onDeleteMonthAll={handleSingleDeleteMonth}
      />

      <BulkShiftCreateModal
        open={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        targetMonth={anchorDate}
        employees={employees} // ✅ 원본 유지
        onSubmit={handleBulkSubmit}
      />
    </div>
  );
}