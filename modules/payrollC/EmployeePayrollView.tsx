"use client"

import { useRef, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Download } from "lucide-react"
import { useReactToPrint } from "react-to-print"

import type { CurrentPayrollSummary, PayrollRecord } from "./payrollTypes"
import PayslipTemplate from "./PayslipTemplate"

type EmployeePayrollViewProps = {
  currentWorkplace: string
  currentSummary: CurrentPayrollSummary
  history: PayrollRecord[]
  employeeName?: string
}

function toYearMonthRaw(label: string): string {
  const m = label.match(/(\d{4})년\s*(\d{1,2})월/)
  if (!m) return ""
  return `${m[1]}-${m[2].padStart(2, "0")}`
}

// ✅ export default 추가
export default function EmployeePayrollView({
  currentWorkplace,
  currentSummary,
  history,
  employeeName,
}: EmployeePayrollViewProps) {
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null)
  const printAreaRef = useRef<HTMLDivElement | null>(null)

  const handlePrint = useReactToPrint({
    contentRef: printAreaRef,
    documentTitle: selectedRecord ? `${selectedRecord.month} 급여지급명세서` : "급여지급명세서",
  } as any)

  const handleDownloadPayslip = (record: PayrollRecord) => {
    setSelectedRecord(null)
    setTimeout(() => { setSelectedRecord(record) }, 0)
  }

  useEffect(() => {
    if (!selectedRecord || !printAreaRef.current) return
    handlePrint()
  }, [selectedRecord])

  const resolvedEmployeeName = selectedRecord?.employeeName ?? employeeName ?? (history.length > 0 ? history[0].employeeName ?? "" : "")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">급여 내역</h1>
        <p className="text-muted-foreground">급여 지급 내역을 확인하세요 - {currentWorkplace}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>이번 달 예상 급여</CardTitle>
          <CardDescription>{currentSummary.titleMonth}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between rounded-lg bg-muted p-4"><span className="text-sm">기본급</span><span className="font-medium">{currentSummary.basePay}</span></div>
            <div className="flex justify-between rounded-lg bg-muted p-4"><span className="text-sm">공제액</span><span className="font-medium text-red-600">{currentSummary.deductions}</span></div>
            <div className="border-t pt-4 flex justify-between"><span className="text-lg font-medium">예상 실수령액</span><span className="text-2xl font-bold text-primary">{currentSummary.netPay}</span></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>급여 지급 내역</CardTitle><CardDescription>과거 급여 지급 기록입니다</CardDescription></CardHeader>
        <CardContent>
          {history.length === 0 ? <p className="text-sm text-muted">이력이 없습니다.</p> : (
            <div className="space-y-3">
              {history.map((record, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="mb-3 flex justify-between"><div><h3 className="font-medium">{record.month}</h3><p className="text-sm text-muted-foreground">지급일: {record.paidDate}</p></div><Badge>{record.status}</Badge></div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">기본급</span><span>₩{record.basePay.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">공제액</span><span className="text-red-600">-₩{record.deductions.toLocaleString()}</span></div>
                    <div className="flex justify-between border-t pt-2 font-medium"><span>실수령액</span><span className="text-primary">₩{record.netPay.toLocaleString()}</span></div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => handleDownloadPayslip(record)}><Download className="mr-2 h-4 w-4" /> 급여명세서 다운로드</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div style={{ position: "absolute", top: -9999, left: -9999 }}>
        <div ref={printAreaRef}>
          {selectedRecord && (
            <PayslipTemplate
              yearMonth={toYearMonthRaw(selectedRecord.month)} employeeName={resolvedEmployeeName} department={currentWorkplace}
              basePay={selectedRecord.basePay} grossPay={selectedRecord.netPay + selectedRecord.deductions} deductions={selectedRecord.deductions}
              netPay={selectedRecord.netPay} workDays={selectedRecord.workDays} workHours={selectedRecord.workHours}
              wageType={selectedRecord.wageType} deductionType={selectedRecord.deductionType}
            />
          )}
        </div>
      </div>
    </div>
  )
}