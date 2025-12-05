// features/employee/payroll/components/EmployeePayrollView.tsx
"use client"

import { useRef, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useReactToPrint } from "react-to-print"

import type { CurrentPayrollSummary, PayrollRecord } from "../services/payrollService"
import PayslipTemplate from "@/features/owner/payroll/components/PayslipTemplate"

type EmployeePayrollViewProps = {
  currentWorkplace: string
  currentSummary: CurrentPayrollSummary
  history: PayrollRecord[]
  // 서비스에서 내려준 직원 이름(옵션)
  employeeName?: string
}

// "2025년 12월" → "2025-12" 변환 헬퍼
function toYearMonthRaw(label: string): string {
  const m = label.match(/(\d{4})년\s*(\d{1,2})월/)
  if (!m) return ""
  const year = m[1]
  const month = m[2].padStart(2, "0")
  return `${year}-${month}`
}

export function EmployeePayrollView({
  currentWorkplace,
  currentSummary,
  history,
  employeeName,
}: EmployeePayrollViewProps) {
  // 👉 어떤 기록을 다운로드할지 선택
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null)

  // 👉 react-to-print 설정
  const printAreaRef = useRef<HTMLDivElement | null>(null)

  const handlePrint = useReactToPrint({
    contentRef: printAreaRef,
    documentTitle: selectedRecord
      ? `${selectedRecord.month} 급여지급명세서`
      : "급여지급명세서",
  })

  const handleDownloadPayslip = (record: PayrollRecord) => {
    setSelectedRecord(record)
    // 상태 반영 후 프린트 호출
    setTimeout(() => {
      handlePrint()
    }, 0)
  }

  // 👉 명세서에 찍을 직원 이름
  // 1순위: 선택한 기록의 employeeName
  // 2순위: props 로 들어온 employeeName
  // 3순위: history 첫번째 기록의 employeeName
  const resolvedEmployeeName =
    selectedRecord?.employeeName ??
    employeeName ??
    (history.length > 0 ? history[0].employeeName ?? "" : "")

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">급여 내역</h1>
        <p className="text-muted-foreground">
          급여 지급 내역을 확인하세요 - {currentWorkplace}
        </p>
      </div>

      {/* 이번 달 예상 급여 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>이번 달 예상 급여</CardTitle>
              <CardDescription>{currentSummary.titleMonth}</CardDescription>
            </div>
            {/* 상단 상태 뱃지(예상/PAID) 제거 */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 기본급 */}
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <span className="text-sm text-muted-foreground">기본급</span>
              <span className="font-medium">{currentSummary.basePay}</span>
            </div>

            {/* 상여금 항목 제거 */}

            {/* 공제액 */}
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <span className="text-sm text-muted-foreground">공제액</span>
              <span className="font-medium text-red-600">
                {currentSummary.deductions}
              </span>
            </div>

            {/* 예상 실수령액 */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">예상 실수령액</span>
                <span className="text-2xl font-bold text-primary">
                  {currentSummary.netPay}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 급여 지급 내역 */}
      <Card>
        <CardHeader>
          <CardTitle>급여 지급 내역</CardTitle>
          <CardDescription>과거 급여 지급 기록입니다</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">급여 이력이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {history.map((record, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{record.month}</h3>
                      <p className="text-sm text-muted-foreground">
                        지급일: {record.paidDate}
                      </p>
                    </div>
                    <Badge variant="default">{record.status}</Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">기본급</span>
                      <span>₩{record.basePay.toLocaleString()}</span>
                    </div>

                    {/* 상여금 항목 제거 */}

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">공제액</span>
                      <span className="text-red-600">
                        -₩{record.deductions.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between border-t pt-2 font-medium">
                      <span>실수령액</span>
                      <span className="text-primary">
                        ₩{record.netPay.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full bg-transparent"
                    onClick={() => handleDownloadPayslip(record)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    급여명세서 다운로드
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔒 숨겨진 명세서 영역 (다운로드용) */}
      <div style={{ position: "absolute", top: -9999, left: -9999 }}>
        <div ref={printAreaRef}>
          {selectedRecord && (
            <PayslipTemplate
              // "2025년 12월" -> "2025-12" 로 변환해서 넘김
              yearMonth={toYearMonthRaw(selectedRecord.month)}
              employeeName={resolvedEmployeeName}
              department={currentWorkplace}
              basePay={selectedRecord.basePay}
              // 총 지급액 = 실수령 + 공제
              grossPay={selectedRecord.netPay + selectedRecord.deductions}
              deductions={selectedRecord.deductions}
              netPay={selectedRecord.netPay}
              workDays={selectedRecord.workDays}
              workHours={selectedRecord.workHours}
              wageType={selectedRecord.wageType}
              deductionType={selectedRecord.deductionType}
            />
          )}
        </div>
      </div>
    </div>
  )
}