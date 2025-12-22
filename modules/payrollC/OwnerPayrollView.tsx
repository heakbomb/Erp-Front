"use client"

import { useMemo, useState, useEffect } from "react"
import { format, differenceInCalendarDays, addMonths } from "date-fns"
import { useStore } from "@/contexts/StoreContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { Label } from "@/shared/ui/label"
import { FileText, DollarSign, Users, Calculator, ChevronLeft, ChevronRight } from "lucide-react"

import useOwnerPayroll from "./useOwnerPayroll"
import CurrentPayrollTab from "./CurrentPayrollTab"
import PayrollHistoryTab from "./PayrollHistoryTab"
import PayrollSettingsTab from "./PayrollSettingsTab"

export default function OwnerPayrollView() {
  const [yearMonth, setYearMonth] = useState<string>(format(new Date(), "yyyy-MM"))
  const [isNetPayVisible, setIsNetPayVisible] = useState(false)

  // ✅ 이번 달까지만 허용 (미래 월 차단)
  const maxMonth = useMemo(() => format(new Date(), "yyyy-MM"), [])
  const clampMonth = (ym: string) => {
    if (!ym) return maxMonth
    // "yyyy-MM" 고정 포맷 → 문자열 비교로 월 비교 가능
    if (ym > maxMonth) return maxMonth
    return ym
  }
  const isAtMaxMonth = yearMonth >= maxMonth

  const monthLabel = useMemo(() => {
    try {
      return format(new Date(`${yearMonth}-01`), "yyyy년 M월")
    } catch {
      return "선택 월"
    }
  }, [yearMonth])

  useEffect(() => {
    // ✅ month 바뀌면 실수령 표시 초기화
    setIsNetPayVisible(false)
  }, [yearMonth])

  // ✅ 혹시 외부/직접입력으로 미래월 들어오면 자동 보정
  useEffect(() => {
    setYearMonth((prev) => clampMonth(prev))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxMonth])

  const { payDateLabel, payDDayLabel } = useMemo(() => {
    try {
      const [y, m] = yearMonth.split("-").map(Number)
      const payDate = new Date(y, m, 5)
      const diff = differenceInCalendarDays(payDate, new Date())
      const dLabel = diff > 0 ? `D-${diff}일` : diff === 0 ? "오늘 지급" : "지급 완료"
      return { payDateLabel: format(payDate, "M월 d일"), payDDayLabel: dLabel }
    } catch {
      return { payDateLabel: "-", payDDayLabel: "" }
    }
  }, [yearMonth])

  const {
    employees,
    totalPayroll,
    totalWorkHours,
    filteredEmployees,
    searchQuery,
    setSearchQuery,
    loading,
    error,
  } = useOwnerPayroll(yearMonth)

  const { currentStoreId } = useStore() as any

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">급여 관리</h1>
          <p className="text-muted-foreground">{monthLabel} 기준 직원 급여를 계산하고 관리하세요</p>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex items-end gap-2">
            {/* 이전 달 */}
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setYearMonth((prev) =>
                  clampMonth(format(addMonths(new Date(`${prev}-01`), -1), "yyyy-MM"))
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex flex-col items-end gap-1">
              <Label className="text-xs text-muted-foreground">조회 월</Label>
              <Input
                type="month"
                className="w-[190px]"
                value={yearMonth}
                max={maxMonth} // ✅ 다음 달 선택 자체를 막음
                onChange={(e) => setYearMonth(clampMonth(e.target.value))}
              />
            </div>

            {/* 다음 달 (미래 월 차단) */}
            <Button
              variant="outline"
              size="icon"
              disabled={isAtMaxMonth}
              onClick={() => {
                if (isAtMaxMonth) return
                const next = format(addMonths(new Date(`${yearMonth}-01`), 1), "yyyy-MM")
                setYearMonth(clampMonth(next))
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 급여</CardTitle>
            <DollarSign className="h-4 w-4 text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{totalPayroll.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">대상 직원</CardTitle>
            <Users className="h-4 w-4 text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}명</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">평균 급여</CardTitle>
            <Calculator className="h-4 w-4 text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{(employees.length ? Math.round(totalPayroll / employees.length) : 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">지급 예정일</CardTitle>
            <FileText className="h-4 w-4 text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payDateLabel}</div>
            <p className="text-xs text-muted-foreground">{payDDayLabel}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">이번 달 급여</TabsTrigger>
          <TabsTrigger value="history">급여 지급 내역</TabsTrigger>
          <TabsTrigger value="settings">급여 설정</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <CurrentPayrollTab
            monthLabel={monthLabel}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredEmployees={filteredEmployees}
            employeesCount={employees.length}
            totalWorkHours={totalWorkHours}
            totalPayroll={totalPayroll}
            showNetPay={isNetPayVisible}
            onCalcFinished={() => setIsNetPayVisible(true)}
            storeId={currentStoreId}
          />
        </TabsContent>

        <TabsContent value="history">
          <PayrollHistoryTab />
        </TabsContent>

        <TabsContent value="settings">
          <PayrollSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
