// features/owner/payroll/components/OwnerPayrollView.tsx
"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { format, differenceInCalendarDays, addMonths } from "date-fns"
import { useStore } from "@/contexts/StoreContext"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  FileText,
  DollarSign,
  Users,
  Calculator,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { useReactToPrint } from "react-to-print"

import useOwnerPayroll from "@/features/owner/payroll/hooks/useOwnerPayroll"

import CurrentPayrollTab from "@/features/owner/payroll/components/CurrentPayrollTab"
import PayrollHistoryTab from "@/features/owner/payroll/components/PayrollHistoryTab"
import PayrollSettingsTab from "@/features/owner/payroll/components/PayrollSettingsTab"
import PayslipTemplate from "@/features/owner/payroll/components/PayslipTemplate"

export default function OwnerPayrollView() {
  // ✅ 선택 월 (기본: 오늘 기준)
  const [yearMonth, setYearMonth] = useState<string>(format(new Date(), "yyyy-MM"))

  // ✅ 실수령액 노출 여부 (급여 자동 계산 완료 후에만 true)
  const [isNetPayVisible, setIsNetPayVisible] = useState(false)

  // 보기 좋게 "2024년 4월" 같은 라벨로 변환
  const monthLabel = useMemo(() => {
    try {
      const baseDate = new Date(`${yearMonth}-01`)
      return format(baseDate, "yyyy년 M월")
    } catch {
      return "선택 월"
    }
  }, [yearMonth])

  // 월이 바뀌면 실수령액 표시 다시 숨기기
  useEffect(() => {
    setIsNetPayVisible(false)
  }, [yearMonth])

  // 지급 예정일: 선택 월의 다음 달 5일
  const { payDateLabel, payDDayLabel } = useMemo(() => {
    try {
      const [y, m] = yearMonth.split("-").map(Number)
      const payDate = new Date(y, m, 5) // 다음 달 5일
      const label = format(payDate, "M월 d일")

      const today = new Date()
      const d = differenceInCalendarDays(payDate, today)

      let dLabel = ""
      if (d > 0) dLabel = `D-${d}일`
      else if (d === 0) dLabel = "오늘 지급"
      else dLabel = "지급 완료"

      return { payDateLabel: label, payDDayLabel: dLabel }
    } catch {
      return { payDateLabel: "-", payDDayLabel: "" }
    }
  }, [yearMonth])

  const {
    employees,
    history,
    totalPayroll,
    totalWorkHours,
    filteredEmployees,
    searchQuery,
    setSearchQuery,
    isSettingsDialogOpen,
    setIsSettingsDialogOpen,
    loading,
    error,
  } = useOwnerPayroll(yearMonth)

  // 🔥 TODO: 실제 선택된 사업장 ID로 교체
  const storeId = 11

  // 🔥 StoreContext 에서 사업장 이름 가져오기
  const { currentStoreId, currentStoreName, currentStore } = useStore() as any
  const storeName =
    currentStore?.storeName ??
    currentStore?.name ??
    currentStoreName ??
    "(사업장)"

  // ✅ 월 변경 (이전/다음 달 버튼용)
  const handleChangeMonth = (offset: number) => {
    try {
      const base = new Date(`${yearMonth}-01`)
      const next = addMonths(base, offset)
      setYearMonth(format(next, "yyyy-MM"))
    } catch {
      // yearMonth 포맷이 깨졌을 때만 방어
    }
  }

  // ================================
  // 🔥 급여명세서 일괄 인쇄용 설정 (react-to-print v3)
  // ================================
  const printAreaRef = useRef<HTMLDivElement | null>(null)

  const handlePrintAllPayslips = useReactToPrint({
    contentRef: printAreaRef, // ✅ v3 스타일: contentRef 사용
    documentTitle: `${monthLabel} 급여지급명세서`,
  }as any
) 

  const handleClickPayslipPrint = () => {
    if (!employees.length) {
      alert("이번 달 급여 데이터가 없습니다.")
      return
    }
    if (!isNetPayVisible) {
      alert("먼저 '급여 자동 계산'을 실행한 후 급여명세서를 생성해 주세요.")
      return
    }
    if (!printAreaRef.current) {
      // ref가 아직 붙지 않은 경우 방어
      console.error("printAreaRef is null")
      alert("인쇄 영역이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.")
      return
    }
    handlePrintAllPayslips()
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">급여 관리</h1>
          <p className="text-muted-foreground">
            {monthLabel} 기준 직원 급여를 계산하고 관리하세요
          </p>
          {error && (
            <p className="mt-1 text-xs text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* 우측 컨트롤 영역 */}
        <div className="flex flex-col items-end gap-3">
          {/* ▶ 월 선택 + 이전/다음 버튼 */}
          <div className="flex items-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => handleChangeMonth(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex flex-col items-end gap-1">
              <Label className="text-xs text-muted-foreground">조회 월</Label>
              <Input
                type="month"
                className="w-[190px]"
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => handleChangeMonth(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* ▶ 액션 버튼들 (명세서/엑셀) */}
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              className="bg-transparent"
              onClick={handleClickPayslipPrint}
            >
              <FileText className="mr-2 h-4 w-4" />
              급여명세서 일괄 생성
            </Button>
          </div>
        </div>
      </div>

      {/* 상단 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 직원 총 급여</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{totalPayroll.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              전월 대비 추이는 추후 제공 예정
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">급여 대상 직원</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}명</div>
            <p className="text-xs text-muted-foreground">
              현재 선택된 사업장의 직원 수입니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 급여</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{(employees.length ? Math.round(totalPayroll / employees.length) : 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">1인당 평균</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">지급 예정일</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payDateLabel}</div>
            <p className="text-xs text-muted-foreground">{payDDayLabel}</p>
          </CardContent>
        </Card>
      </div>

      {/* 탭 구조 */}
      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">이번 달 급여</TabsTrigger>
          <TabsTrigger value="history">급여 지급 내역</TabsTrigger>
          <TabsTrigger value="settings">급여 설정</TabsTrigger>
        </TabsList>

        {/* 이번 달 급여 탭 */}
        <TabsContent value="current" className="space-y-4">
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
            storeId={storeId}
          />
        </TabsContent>

        {/* 급여 지급 내역 탭 */}
        <TabsContent value="history" className="space-y-4">
          <PayrollHistoryTab />
        </TabsContent>

        {/* 급여 설정 탭 */}
        <TabsContent value="settings" className="space-y-4">
          <PayrollSettingsTab />
        </TabsContent>
      </Tabs>

      {/* ================================
          🔒 인쇄용 숨겨진 급여명세서 영역
         ================================ */}
      <div style={{ position: "absolute", top: -9999, left: -9999 }}>
        <div ref={printAreaRef}>
          {employees.map((emp) => {
            const grossPay = emp.netPay + emp.deductions

            return (
              <div key={emp.id} style={{ pageBreakAfter: "always" }}>
                <PayslipTemplate
                  yearMonth={yearMonth}
                  employeeName={emp.name}
                  department={storeName}
                  basePay={emp.basePay}
                  grossPay={grossPay}
                  deductions={emp.deductions}
                  netPay={emp.netPay}
                  workDays={emp.workDays}
                  workHours={emp.workHours}
                  wageType={(emp as any).wageType}
                  deductionType={(emp as any).deductionType}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}