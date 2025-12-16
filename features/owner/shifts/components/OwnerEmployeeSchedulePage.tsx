// features/owner/shifts/components/OwnerEmployeeSchedulePage.tsx
"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { useQueryClient } from "@tanstack/react-query" // ✅ 추가

import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs"

import { useStore } from "@/contexts/StoreContext"
import { useEmployeeShifts } from "@/features/owner/shifts/hooks/useEmployeeShifts"
import WeekScheduleGrid from "@/features/owner/shifts/components/WeekScheduleGrid"
import MonthScheduleGrid from "@/features/owner/shifts/components/MonthScheduleGrid"
import ShiftCreateModal from "@/features/owner/shifts/components/ShiftCreateModal"
import ShiftBulkModal from "@/features/owner/shifts/components/ShiftBulkModal" // ✅ 추가
import { fetchEmployees } from "@/features/owner/employees/services/employeesService"
import { createShiftBulk } from "@/features/owner/shifts/services/employeeShiftService" // ✅ 추가
import type { Employee, EmployeeShift } from "@/shared/types/database"

// ✅ 로컬 기준 yyyy-MM-dd 포맷 (toISOString 절대 사용 X)
function toDateOnlyString(d: Date): string {
  return format(d, "yyyy-MM-dd")
}

function startOfWeek(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const day = date.getDay() // 0(일) ~ 6(토)
  const diff = (day + 6) % 7 // 월요일 기준
  date.setDate(date.getDate() - diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function addDays(d: Date, n: number): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  date.setDate(date.getDate() + n)
  return date
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

export default function EmployeeSchedulePage() {
  const router = useRouter()
  const { currentStoreId } = useStore()
  const queryClient = useQueryClient() // ✅ 추가

  const [mode, setMode] = useState<"WEEK" | "MONTH">("WEEK")
  const [anchorDate, setAnchorDate] = useState<Date>(startOfWeek(new Date()))
  const [employees, setEmployees] = useState<Employee[]>([])

  const [createOpen, setCreateOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editingShift, setEditingShift] = useState<EmployeeShift | null>(null)
  const [bulkOpen, setBulkOpen] = useState(false) // ✅ 월간 일괄등록 모달

  // 날짜 범위 계산 (주간 / 월간)
  const { rangeLabel, from, to, weekDays, monthDates } = useMemo(() => {
    if (mode === "WEEK") {
      const start = startOfWeek(anchorDate)
      const end = addDays(start, 6)
      const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i))
      return {
        rangeLabel: `${toDateOnlyString(start)} ~ ${toDateOnlyString(end)}`,
        from: toDateOnlyString(start),
        to: toDateOnlyString(end),
        weekDays: days,
        monthDates: [] as Date[],
      }
    } else {
      const start = startOfMonth(anchorDate)
      const end = endOfMonth(anchorDate)

      // 달력용 날짜 (앞뒤 공백 포함)
      const firstWeekStart = startOfWeek(start)
      const dates: Date[] = []

      for (
        let d = new Date(
          firstWeekStart.getFullYear(),
          firstWeekStart.getMonth(),
          firstWeekStart.getDate(),
        );
        ;
        d = addDays(d, 1)
      ) {
        dates.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()))

        // 해당 달의 마지막 날(일요일)까지 채우기
        if (
          d.getFullYear() === end.getFullYear() &&
          d.getMonth() === end.getMonth() &&
          d.getDate() === end.getDate() &&
          d.getDay() === 0
        ) {
          break
        }

        if (dates.length >= 42) break // 6주 * 7일 안전장치
      }

      return {
        rangeLabel: `${toDateOnlyString(start)} ~ ${toDateOnlyString(end)}`,
        from: toDateOnlyString(start),
        to: toDateOnlyString(end),
        weekDays: [] as Date[],
        monthDates: dates,
      }
    }
  }, [mode, anchorDate])

  // 근무표 데이터 조회 + CRUD 훅
  const {
    data: shifts = [],
    isLoading,
    createShift,
    updateShift,
    deleteShift,
    deleteShiftRange,
  } = useEmployeeShifts({ from, to })

  // 직원 목록 조회 (현재 사업장 기준)
  useEffect(() => {
    if (!currentStoreId) return
    fetchEmployees(currentStoreId).then(setEmployees).catch(console.error)
  }, [currentStoreId])

  const handlePrev = () => {
    setAnchorDate((prev) =>
      mode === "WEEK" ? addDays(prev, -7) : new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    )
  }

  const handleNext = () => {
    setAnchorDate((prev) =>
      mode === "WEEK" ? addDays(prev, 7) : new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    )
  }

  const handleToday = () => {
    setAnchorDate(startOfWeek(new Date()))
  }

  // 새 근무 추가용 – 날짜만 세팅
  const handleOpenCreate = (dateStr: string) => {
    setEditingShift(null)
    setSelectedDate(dateStr)
    setCreateOpen(true)
  }

  // 기존 근무 클릭 시 수정 모드로 모달 오픈
  const handleOpenEdit = (shift: EmployeeShift) => {
    setEditingShift(shift)
    setSelectedDate(shift.shiftDate)
    setCreateOpen(true)
  }

  // 추가/수정 공통 onSubmit
  const handleSubmit = async (
    values: {
      employeeId: number | ""
      date: string
      startTime: string
      endTime: string
      breakMinutes?: number | null
    },
    shiftId?: number,
  ) => {
    if (!currentStoreId) {
      alert("현재 선택된 사업장이 없습니다.")
      return
    }

    if (!values.employeeId) {
      alert("직원을 선택해주세요.")
      return
    }

    const base = {
      employeeId: Number(values.employeeId),
      date: values.date,
      startTime: values.startTime,
      endTime: values.endTime,
      breakMinutes: values.breakMinutes ?? 0,
      isFixed: false,
    }

    if (shiftId) {
      await updateShift({
        shiftId,
        body: base,
      })
    } else {
      await createShift(base)
    }

    setCreateOpen(false)
    setEditingShift(null)
  }

  // 삭제
  const handleDelete = async (shiftId: number) => {
    await deleteShift(shiftId)
    setCreateOpen(false)
    setEditingShift(null)
  }

  // ✅ 이번 달 전체 삭제
  const handleDeleteMonthAll = async (employeeId: number) => {
    if (!currentStoreId || !selectedDate) return

    const baseDate = new Date(selectedDate)
    const monthStart = startOfMonth(baseDate)
    const monthEnd = endOfMonth(baseDate)

    const fromStr = toDateOnlyString(monthStart)
    const toStr = toDateOnlyString(monthEnd)

    const ok = window.confirm(
      `${fromStr} ~ ${toStr} 기간 동안\n선택한 직원의 근무를 모두 삭제할까요?`,
    )
    if (!ok) return

    await deleteShiftRange({
      employeeId,
      from: fromStr,
      to: toStr,
    })

    setCreateOpen(false)
    setEditingShift(null)
  }

  // ✅ 월간/기간 일괄 등록 핸들러
  const handleBulkSubmit = async (values: {
    employeeId: number;
    startDate: string;
    endDate: string;
    weekdays: number[]; // 1~7 (월~일)
    startTime: string;
    endTime: string;
    breakMinutes?: number | null;
    isFixed?: boolean;
  }) => {
    if (!currentStoreId) {
      alert("현재 선택된 사업장이 없습니다.")
      return
    }

    const start = new Date(values.startDate)
    const end = new Date(values.endDate)

    const dates: string[] = []

    // start ~ end 까지 하루씩 돌면서 요일 필터
    for (
      let d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      d <= end;
      d.setDate(d.getDate() + 1)
    ) {
      const jsDay = d.getDay() // 0(일) ~ 6(토)
      const weekday = jsDay === 0 ? 7 : jsDay // 1~7로 변환 (월=1, ..., 일=7)

      if (!values.weekdays.includes(weekday)) continue

      dates.push(format(d, "yyyy-MM-dd"))
    }

    if (dates.length === 0) {
      alert("선택된 요일에 해당하는 날짜가 없습니다.")
      return
    }

    await createShiftBulk({
      storeId: currentStoreId,
      employeeId: values.employeeId,
      dates,
      startTime: values.startTime,
      endTime: values.endTime,
      breakMinutes: values.breakMinutes ?? 0,
      isFixed: values.isFixed ?? false,
    })

    // ✅ 일괄 등록 후 현재 범위 근무표 강제 리프레시
    await queryClient.invalidateQueries({
      queryKey: ["employeeShifts", currentStoreId, from, to],
    })

    setBulkOpen(false)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-4 lg:space-y-6">
      {/* 상단 타이틀 + 돌아가기 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">직원 근무 시간표</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            주간 / 월간 근무표를 한눈에 확인하고, 사장님이 직접 스케줄을 설정할 수 있습니다.
          </p>
          {employees.length > 0 && (
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              등록된 직원 ({employees.length}명):{" "}
              {employees.map((e) => e.name).join(", ")}
            </p>
          )}
        </div>

        <Button
          variant="outline"
          className="mt-1"
          onClick={() => router.push("/owner/employees")}
        >
          ← 직원 관리로 돌아가기
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4 sm:pt-6 space-y-4">
          {/* 상단 날짜 네비게이션 */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs
              defaultValue={mode === "WEEK" ? "week" : "month"}
              value={mode === "WEEK" ? "week" : "month"}
              onValueChange={(v) => setMode(v === "week" ? "WEEK" : "MONTH")}
            >
              <TabsList>
                <TabsTrigger value="week">주간 보기</TabsTrigger>
                <TabsTrigger value="month">월간 보기</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="flex items-center gap-2" disabled>
                <Calendar className="h-4 w-4" />
                <span className="text-xs sm:text-sm">{rangeLabel}</span>
              </Button>
              <Button variant="outline" size="icon" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleToday}>
                오늘
              </Button>

              {/* ✅ 월간 일괄 등록 버튼 */}
              <Button
                variant="default"
                size="sm"
                className="ml-2"
                onClick={() => setBulkOpen(true)}
              >
                월간 근무 일괄 등록
              </Button>
            </div>
          </div>

          {/* 실제 그리드 */}
          <Tabs
            defaultValue={mode === "WEEK" ? "week" : "month"}
            value={mode === "WEEK" ? "week" : "month"}
            className="space-y-4"
          >
            <TabsContent value="week">
              <WeekScheduleGrid
                days={weekDays}
                shifts={shifts as EmployeeShift[]}
                employees={employees}
                onDayCreate={handleOpenCreate}
                onShiftClick={handleOpenEdit}
              />
            </TabsContent>

            <TabsContent value="month">
              <MonthScheduleGrid
                dates={monthDates}
                shifts={shifts as EmployeeShift[]}
                employees={employees}
                onDayCreate={handleOpenCreate}
                onShiftClick={handleOpenEdit}
              />
            </TabsContent>
          </Tabs>

          {isLoading && (
            <p className="text-sm text-muted-foreground">근무표를 불러오는 중입니다…</p>
          )}
        </CardContent>
      </Card>

      {/* 근무 추가/수정 모달 */}
      {selectedDate && (
        <ShiftCreateModal
          open={createOpen}
          onClose={() => {
            setCreateOpen(false)
            setEditingShift(null)
          }}
          date={selectedDate}
          employees={employees}
          initialShift={editingShift}
          onSubmit={handleSubmit}
          onDelete={editingShift ? handleDelete : undefined}
          onDeleteMonthAll={handleDeleteMonthAll}
        />
      )}

      {/* ✅ 월간 일괄 등록 모달 */}
      {bulkOpen && (
        <ShiftBulkModal
          open={bulkOpen}
          onClose={() => setBulkOpen(false)}
          employees={employees}
          defaultMonth={anchorDate}
          onSubmit={handleBulkSubmit}
        />
      )}
    </div>
  )
}