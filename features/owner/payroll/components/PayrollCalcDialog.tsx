// features/owner/payroll/components/PayrollCalcDialog.tsx
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
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calculator } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import usePayrollCalc from "@/features/owner/payroll/hooks/usePayrollCalc"
import { saveMonthlyPayrollHistory } from "@/features/owner/payroll/services/payrollHistoryService"

type Props = {
  isOpen: boolean
  setIsOpen: (v: boolean) => void
  monthLabel: string
  totalWorkHours: number
  totalPayroll: number
  employeesCount: number
  loading: boolean // 👉 리스트 조회 로딩
  onCalcFinished?: () => void   // 🔥 계산 완료 콜백 (추가)
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
  storeId
}: Props) {
  // 🔥 급여 계산용 훅
  const { loading: calcLoading, error, result, runCalc } = usePayrollCalc()

  // ✅ UI 전용 로딩 상태 (스피너를 최소 3초 유지)
  const [uiLoading, setUiLoading] = useState(false)

  // "2025년 12월" → "2025-12" 로 변환 (백엔드 yearMonth 용)
  const yearMonthKey = useMemo(() => {
    const match = monthLabel.match(/(\d{4})년\s*(\d{1,2})월/)
    if (!match) return ""
    const year = match[1]
    const month = match[2].padStart(2, "0")
    return `${year}-${month}`
  }, [monthLabel])

  // ✅ 계산 시작 시: 스피너를 최소 3초 동안 돌리고, 그 사이에 runCalc도 같이 수행
  const handleStartCalc = async () => {
  if (!yearMonthKey) return
  if (uiLoading || calcLoading) return

  setUiLoading(true)
  try {
    const minDelay = new Promise((resolve) => setTimeout(resolve, 3000))

    // 1) 급여 자동 계산
    await Promise.all([
      runCalc(yearMonthKey), // 실제 급여 계산 API
      minDelay,              // 최소 3초 로딩 유지
    ])

    // 2) 계산이 성공적으로 끝났다면 → 이번 달 급여 지급 내역을 history 테이블에 저장
    await saveMonthlyPayrollHistory({
      storeId,
      yearMonth: yearMonthKey, // "2025-12"
    })

    // 3) 실수령액 노출 + 상위에 계산완료 알림
    onCalcFinished?.()
  } finally {
    setUiLoading(false)
  }
}

  const isButtonDisabled =
    listLoading || calcLoading || uiLoading || employeesCount === 0 || !yearMonthKey

  // 공제 유형 라벨 변환
  const renderDeductionLabel = (type?: string | null) => {
    switch (type) {
      case "FOUR_INSURANCE":
        return "4대 보험"
      case "TAX_3_3":
        return "3.3% 공제"
      case "NONE":
      case "":
      case null:
      case undefined:
        return "없음"
      default:
        return "없음"
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
          {/* 상단 요약 */}
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

            {error && (
              <p className="mt-2 text-xs text-red-600">
                {error}
              </p>
            )}
          </div>

          {/* 계산 중 로딩 UI (3초 동안 유지) */}
          {showLoading && (
            <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-md border bg-muted/60 py-8">
              <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm font-medium text-foreground">
                급여를 계산하는 중입니다…
              </p>
              <p className="text-xs text-muted-foreground">
                근무 기록과 급여 설정을 기반으로 직원별 실수령액을 계산하고 있어요.
              </p>
            </div>
          )}

          {/* 계산 결과 표 (3초 로딩 끝난 후에 노출) */}
          {showResult && result && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">직원별 계산 결과</p>
                <span className="text-xs text-muted-foreground">
                  총 {result.employees.length}명 | 총 지급액 합계:{" "}
                  <span className="font-semibold">
                    ₩
                    {result.employees
                      .reduce((sum, emp) => sum + (emp.basePay ?? 0), 0)
                      .toLocaleString()}
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
                    {result.employees.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">{emp.name}</TableCell>
                        <TableCell>{emp.role}</TableCell>
                        <TableCell>₩{(emp.basePay ?? 0).toLocaleString()}</TableCell>
                        <TableCell className="text-red-600">
                          -₩{(emp.deductions ?? 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium text-primary">
                          ₩{(emp.netPay ?? 0).toLocaleString()}
                        </TableCell>
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

              <p className="mt-2 text-xs text-muted-foreground">
                * 실수령액 = 기본급(시급×근무시간 또는 월급 기준 총지급액) - 공제액(4대보험, 3.3% 공제 등) 으로 계산되었습니다.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            닫기
          </Button>

          {/* 계산 결과가 없을 때만 "계산 시작" 버튼 표시 */}
          {!hasResult && (
            <Button
              onClick={handleStartCalc}
              disabled={isButtonDisabled}
            >
              {uiLoading || calcLoading ? "계산 중..." : "계산 시작"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}