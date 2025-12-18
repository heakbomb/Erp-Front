"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { format, differenceInCalendarDays, addMonths } from "date-fns"
import { useStore } from "@/contexts/StoreContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { Label } from "@/shared/ui/label"
import { FileText, DollarSign, Users, Calculator, ChevronLeft, ChevronRight } from "lucide-react"
import { useReactToPrint } from "react-to-print"

import useOwnerPayroll from "./useOwnerPayroll"
import CurrentPayrollTab from "./CurrentPayrollTab"
import PayrollHistoryTab from "./PayrollHistoryTab"
import PayrollSettingsTab from "./PayrollSettingsTab"
import PayslipTemplate from "./PayslipTemplate"
// ✅ EmployeePayroll 타입을 import
import type { EmployeePayroll } from "./payrollTypes"

export default function OwnerPayrollView() {
  const [yearMonth, setYearMonth] = useState<string>(format(new Date(), "yyyy-MM"))
  const [isNetPayVisible, setIsNetPayVisible] = useState(false)

  const monthLabel = useMemo(() => {
    try { return format(new Date(`${yearMonth}-01`), "yyyy년 M월") } catch { return "선택 월" }
  }, [yearMonth])

  useEffect(() => { setIsNetPayVisible(false) }, [yearMonth])

  const { payDateLabel, payDDayLabel } = useMemo(() => {
    try {
      const [y, m] = yearMonth.split("-").map(Number)
      const payDate = new Date(y, m, 5)
      const diff = differenceInCalendarDays(payDate, new Date())
      const dLabel = diff > 0 ? `D-${diff}일` : diff === 0 ? "오늘 지급" : "지급 완료"
      return { payDateLabel: format(payDate, "M월 d일"), payDDayLabel: dLabel }
    } catch { return { payDateLabel: "-", payDDayLabel: "" } }
  }, [yearMonth])

  const { employees, totalPayroll, totalWorkHours, filteredEmployees, searchQuery, setSearchQuery, loading, error } = useOwnerPayroll(yearMonth)

  const { currentStoreId, currentStoreName, currentStore } = useStore() as any
  const storeName = currentStore?.storeName ?? currentStore?.name ?? currentStoreName ?? "(사업장)"

  const printAreaRef = useRef<HTMLDivElement | null>(null)
  const handlePrintAllPayslips = useReactToPrint({ contentRef: printAreaRef, documentTitle: `${monthLabel} 급여지급명세서` } as any)

  const handleClickPayslipPrint = () => {
    if (!employees.length) return alert("데이터가 없습니다.")
    if (!isNetPayVisible) return alert("먼저 '급여 자동 계산'을 실행해주세요.")
    handlePrintAllPayslips()
  }

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
            <Button variant="outline" size="icon" onClick={() => setYearMonth(format(addMonths(new Date(`${yearMonth}-01`), -1), "yyyy-MM"))}><ChevronLeft className="h-4 w-4" /></Button>
            <div className="flex flex-col items-end gap-1">
              <Label className="text-xs text-muted-foreground">조회 월</Label>
              <Input type="month" className="w-[190px]" value={yearMonth} onChange={(e) => setYearMonth(e.target.value)} />
            </div>
            <Button variant="outline" size="icon" onClick={() => setYearMonth(format(addMonths(new Date(`${yearMonth}-01`), 1), "yyyy-MM"))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Button variant="outline" onClick={handleClickPayslipPrint}><FileText className="mr-2 h-4 w-4" /> 급여명세서 일괄 생성</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">총 급여</CardTitle><DollarSign className="h-4 w-4 text-muted" /></CardHeader><CardContent><div className="text-2xl font-bold">₩{totalPayroll.toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">대상 직원</CardTitle><Users className="h-4 w-4 text-muted" /></CardHeader><CardContent><div className="text-2xl font-bold">{employees.length}명</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">평균 급여</CardTitle><Calculator className="h-4 w-4 text-muted" /></CardHeader><CardContent><div className="text-2xl font-bold">₩{(employees.length ? Math.round(totalPayroll / employees.length) : 0).toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">지급 예정일</CardTitle><FileText className="h-4 w-4 text-muted" /></CardHeader><CardContent><div className="text-2xl font-bold">{payDateLabel}</div><p className="text-xs text-muted-foreground">{payDDayLabel}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">이번 달 급여</TabsTrigger>
          <TabsTrigger value="history">급여 지급 내역</TabsTrigger>
          <TabsTrigger value="settings">급여 설정</TabsTrigger>
        </TabsList>
        <TabsContent value="current">
          <CurrentPayrollTab
            monthLabel={monthLabel} loading={loading} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            filteredEmployees={filteredEmployees} employeesCount={employees.length} totalWorkHours={totalWorkHours}
            totalPayroll={totalPayroll} showNetPay={isNetPayVisible} onCalcFinished={() => setIsNetPayVisible(true)}
            storeId={currentStoreId}
          />
        </TabsContent>
        <TabsContent value="history"><PayrollHistoryTab /></TabsContent>
        <TabsContent value="settings"><PayrollSettingsTab /></TabsContent>
      </Tabs>

      <div style={{ position: "absolute", top: -9999, left: -9999 }}>
        <div ref={printAreaRef}>
          {employees.map((emp: EmployeePayroll) => (
            <div key={emp.id} style={{ pageBreakAfter: "always" }}>
              <PayslipTemplate
                yearMonth={yearMonth} employeeName={emp.name} department={storeName} basePay={emp.basePay}
                grossPay={emp.netPay + emp.deductions} deductions={emp.deductions} netPay={emp.netPay}
                workDays={emp.workDays} workHours={emp.workHours}
                wageType={(emp as any).wageType} deductionType={(emp as any).deductionType}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}