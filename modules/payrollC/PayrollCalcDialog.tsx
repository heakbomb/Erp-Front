"use client"

import { useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Calculator } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"

import usePayrollCalc from "./usePayrollCalc"
import { saveMonthlyPayrollHistory } from "./payrollApi"
import type { PayrollCalcEmployee } from "./payrollTypes"

type Props = {
  isOpen: boolean
  setIsOpen: (v: boolean) => void
  monthLabel: string
  totalWorkHours: number
  totalPayroll: number
  employeesCount: number
  loading: boolean
  onCalcFinished?: () => void
  storeId: number
}

export default function PayrollCalcDialog({
  isOpen,
  setIsOpen,
  monthLabel,
  totalWorkHours,
  totalPayroll,
  employeesCount,
  loading: listLoading,
  onCalcFinished,
  storeId,
}: Props) {
  const { loading: calcLoading, error, result, runCalc } = usePayrollCalc()
  const [uiLoading, setUiLoading] = useState(false)

  const yearMonthKey = useMemo(() => {
    const match = monthLabel.match(/(\d{4})년\s*(\d{1,2})월/)
    if (!match) return ""
    const year = match[1]
    const month = match[2].padStart(2, "0")
    return `${year}-${month}`
  }, [monthLabel])

  const currentYearMonth = useMemo(() => {
    const now = new Date()
    const y = String(now.getFullYear())
    const m = String(now.getMonth() + 1).padStart(2, "0")
    return `${y}-${m}`
  }, [])

  const isPastMonth = useMemo(() => {
    if (!yearMonthKey) return false
    return yearMonthKey < currentYearMonth
  }, [yearMonthKey, currentYearMonth])

  const handleStartCalc = async () => {
    if (!yearMonthKey) return
    if (isPastMonth) {
      alert("지난달(과거 월)은 급여 자동 계산을 할 수 없습니다. 급여 내역만 조회 가능합니다.")
      return
    }
    if (uiLoading || calcLoading) return

    setUiLoading(true)
    try {
      const minDelay = new Promise((resolve) => setTimeout(resolve, 3000))
      await Promise.all([runCalc(yearMonthKey), minDelay])
      await saveMonthlyPayrollHistory({
        storeId,
        yearMonth: yearMonthKey,
      })
      onCalcFinished?.()
    } catch (e) {
      // Error handled in hook
    } finally {
      setUiLoading(false)
    }
  }

  const isButtonDisabled =
    listLoading ||
    calcLoading ||
    uiLoading ||
    employeesCount === 0 ||
    !yearMonthKey ||
    isPastMonth

  const renderDeductionLabel = (type?: string | null) => {
    switch (type) {
      case "FOUR_INSURANCE": return "4대 보험"
      case "TAX_3_3": return "3.3% 공제"
      default: return "없음"
    }
  }

  const hasResult = !!(result && result.employees && result.employees.length > 0)
  const showLoading = uiLoading
  const showResult = hasResult && !uiLoading

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={isButtonDisabled}>
          <Calculator className="mr-2 h-4 w-4" />
          급여 자동 계산
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>급여 자동 계산</DialogTitle>
          <DialogDescription>
            {monthLabel} 근무 기록과 급여 설정 정보를 기반으로 직원별 실수령액을 계산합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {monthLabel} 근무 기록을 기반으로{" "}
              <span className="font-medium">{employeesCount}</span>명의 직원 급여를 계산하시겠습니까?
            </p>
            <div className="mt-4 p-4 rounded-lg bg-muted space-y-2 text-sm">
              <div className="flex justify-between">
                <span>직원 총 근무 시간</span>
                <span className="font-medium">{totalWorkHours.toLocaleString()}시간</span>
              </div>
              <div className="flex justify-between">
                <span>현재 기준 예상 총 급여(실수령액 합계)</span>
                <span className="font-medium text-primary">₩{totalPayroll.toLocaleString()}</span>
              </div>
            </div>
            {isPastMonth && (
              <p className="mt-2 text-xs text-muted-foreground">
                지난달(과거 월)은 급여 자동 계산이 비활성화됩니다. 급여 내역만 조회할 수 있습니다.
              </p>
            )}
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          </div>

          {showLoading && (
            <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-md border bg-muted/60 py-8">
              <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm font-medium text-foreground">급여를 계산하는 중입니다…</p>
            </div>
          )}

          {showResult && result && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">직원별 계산 결과</p>
                <span className="text-xs text-muted-foreground">
                  총 {result.employees.length}명 | 총 지급액 합계:{" "}
                  <span className="font-semibold">
                    {/* ✅ 타입 명시: (sum: number, emp: PayrollCalcEmployee) */}
                    ₩{result.employees.reduce((sum: number, emp: PayrollCalcEmployee) => sum + (emp.basePay ?? 0), 0).toLocaleString()}
                  </span>
                </span>
              </div>
              <div className="border rounded-md max-h-[320px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>역할</TableHead>
                      <TableHead>기본급(총지급액)</TableHead>
                      <TableHead>공제액</TableHead>
                      <TableHead>실수령액</TableHead>
                      <TableHead>공제 유형</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* ✅ 타입 명시: (emp: PayrollCalcEmployee) */}
                    {result.employees.map((emp: PayrollCalcEmployee) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">{emp.name}</TableCell>
                        <TableCell>{emp.role}</TableCell>
                        <TableCell>₩{(emp.basePay ?? 0).toLocaleString()}</TableCell>
                        <TableCell className="text-red-600">-₩{(emp.deductions ?? 0).toLocaleString()}</TableCell>
                        <TableCell className="font-medium text-primary">₩{(emp.netPay ?? 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {renderDeductionLabel((emp as any).deductionType)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>닫기</Button>
          {!hasResult && (
            <Button onClick={handleStartCalc} disabled={isButtonDisabled}>
              {uiLoading || calcLoading ? "계산 중..." : "계산 시작"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}