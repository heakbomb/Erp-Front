"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { useStore } from "@/contexts/StoreContext"

import { FileText } from "lucide-react"
import { useReactToPrint } from "react-to-print"
import PayslipTemplate from "./PayslipTemplate"

import {
  fetchMonthlyPayrollHistory,
  fetchPayrollHistorySummary,
  type PayrollHistoryDetail,
  type PayrollHistorySummary,
} from "./payrollApi"

export default function PayrollHistoryTab() {
  const { currentStoreId, currentStoreName, currentStore } = useStore() as any
  const storeName = currentStore?.storeName ?? currentStore?.name ?? currentStoreName ?? "(사업장)"

  const [summary, setSummary] = useState<PayrollHistorySummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterMonth, setFilterMonth] = useState<string>("")

  // 상세 보기(월)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [details, setDetails] = useState<PayrollHistoryDetail[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // ✅ 출력(다운로드)용
  const printAreaRef = useRef<HTMLDivElement | null>(null)
  const [printMonth, setPrintMonth] = useState<string>("")
  const [printRows, setPrintRows] = useState<PayrollHistoryDetail[]>([])
  const [printingKey, setPrintingKey] = useState<string | null>(null) // "ALL" or employeeId string

  const handlePrint = useReactToPrint({
    contentRef: printAreaRef,
    documentTitle: `${printMonth} 급여지급명세서`,
  } as any)

  const formatWorkHours = (minutes: number) => {
    if (!minutes) return "0시간"
    return `${(minutes / 60).toFixed(1)}시간`
  }

  // 목록 불러오기
  useEffect(() => {
    if (!currentStoreId) return
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchPayrollHistorySummary({ storeId: currentStoreId })
        setSummary(data ?? [])
      } catch {
        setError("급여 지급 내역을 불러오지 못했습니다.")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [currentStoreId])

  const filteredSummary = useMemo(() => {
    if (!filterMonth) return summary
    return summary.filter((s) => s.month.startsWith(filterMonth))
  }, [summary, filterMonth])

  // 월 상세 보기 열기
  const handleOpenDetail = async (month: string) => {
    if (!currentStoreId) return
    setSelectedMonth(month)
    setIsDetailOpen(true)
    setDetailLoading(true)
    setDetailError(null)
    try {
      const data = await fetchMonthlyPayrollHistory({ storeId: currentStoreId, yearMonth: month })
      setDetails(data ?? [])
    } catch {
      setDetailError("지급 내역을 불러오지 못했습니다.")
      setDetails([])
    } finally {
      setDetailLoading(false)
    }
  }

  // ✅ 상세 보기 안에서 "월 전체 명세서 다운로드"
  const handleDownloadAllPayslips = async () => {
    if (!currentStoreId || !selectedMonth) return
    try {
      setPrintingKey("ALL")
      const data = await fetchMonthlyPayrollHistory({ storeId: currentStoreId, yearMonth: selectedMonth })
      if (!data || data.length === 0) {
        alert("해당 월 지급 내역이 없습니다.")
        return
      }
      setPrintMonth(selectedMonth)
      setPrintRows(data)
      requestAnimationFrame(() => handlePrint())
    } catch {
      alert("급여명세서를 생성할 수 없습니다.")
    } finally {
      setPrintingKey(null)
    }
  }

  // ✅ 상세 보기 안에서 "직원 1명 명세서 다운로드"
  const handleDownloadOnePayslip = async (employeeId: number) => {
    if (!currentStoreId || !selectedMonth) return
    try {
      setPrintingKey(String(employeeId))

      // details가 이미 떠있으니 재호출 없이 필터링만 해도 되지만,
      // "최신"을 원하면 다시 fetch해도 됨. (여긴 로컬 details 사용)
      const row = details.find((d) => d.employeeId === employeeId)
      if (!row) {
        alert("직원 지급 내역을 찾을 수 없습니다.")
        return
      }

      setPrintMonth(selectedMonth)
      setPrintRows([row])
      requestAnimationFrame(() => handlePrint())
    } catch {
      alert("급여명세서를 생성할 수 없습니다.")
    } finally {
      setPrintingKey(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>급여 지급 내역</CardTitle>
              <CardDescription>
                월별로 저장된 급여 지급 기록을 확인하고, 직원별 상세 내역을 조회할 수 있습니다.
              </CardDescription>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">조회 월</span>
                <Input
                  type="month"
                  className="w-[160px]"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                />
              </div>
              <Button type="button" variant="ghost" className="h-9 text-xs" onClick={() => setFilterMonth("")}>
                전체 보기
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">불러오는 중...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : filteredSummary.length === 0 ? (
            <p className="text-sm text-muted-foreground">아직 지급 내역이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {filteredSummary.map((record, i) => (
                <div key={i} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <div>
                    <h3 className="font-medium">{record.month}</h3>
                    <p className="text-sm text-muted-foreground">{record.employees}명 지급 / 총 지급액</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold">₩{record.totalPaid.toLocaleString()}</p>
                      <Badge variant="default" className="mt-1">
                        {record.status}
                      </Badge>
                    </div>

                    {/* ✅ 이제 다운로드는 "상세 보기" 안으로 이동 */}
                    <Button variant="outline" size="sm" onClick={() => handleOpenDetail(record.month)}>
                      상세 보기
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ 상세 보기 다이얼로그 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[90vw] max-w-[1200px] max-h-[85vh]">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <DialogTitle>{selectedMonth} 급여 지급 상세 내역</DialogTitle>
                <DialogDescription>선택한 월의 직원별 지급 내역을 확인합니다.</DialogDescription>
              </div>

              {/* ✅ 여기! 상세 보기 내부에 "월 전체 다운로드" 버튼 추가 */}
              <Button
                variant="outline"
                className="mr-6 mt-2"
                onClick={handleDownloadAllPayslips}
                disabled={!selectedMonth || detailLoading || printingKey === "ALL"}
              >
                <FileText className="mr-2 h-4 w-4" />
                {printingKey === "ALL" ? "생성 중..." : "급여명세서 다운로드(전체)"}
              </Button>
            </div>
          </DialogHeader>

          {detailLoading ? (
            <div className="text-center py-10">불러오는 중...</div>
          ) : detailError ? (
            <p className="py-4 text-red-600">{detailError}</p>
          ) : (
            <div className="mt-4 max-h-[65vh] overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>근무일수</TableHead>
                    <TableHead>근무시간</TableHead>
                    <TableHead>총지급액</TableHead>
                    <TableHead>공제액</TableHead>
                    <TableHead>실수령액</TableHead>
                    <TableHead>지급상태</TableHead>
                    <TableHead className="text-right">명세서</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {details.map((row) => (
                    <TableRow key={row.payrollId}>
                      <TableCell>{row.employeeName}</TableCell>
                      <TableCell>{row.role}</TableCell>
                      <TableCell>{row.workDays}일</TableCell>
                      <TableCell>{formatWorkHours(row.workMinutes)}</TableCell>
                      <TableCell>₩{row.grossPay.toLocaleString()}</TableCell>
                      <TableCell className="text-red-600">-₩{row.deductions.toLocaleString()}</TableCell>
                      <TableCell className="font-bold text-primary">₩{row.netPay.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.status}</Badge>
                      </TableCell>

                      {/* ✅ 직원 1명 다운로드 버튼 */}
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadOnePayslip(row.employeeId)}
                          disabled={printingKey === String(row.employeeId)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          {printingKey === String(row.employeeId) ? "생성 중..." : "다운로드"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ✅ 프린트(다운로드)용 숨김 영역
          - 브라우저 인쇄 창에서 "PDF로 저장"을 누르면 다운로드처럼 동작 */}
      <div style={{ position: "absolute", top: -9999, left: -9999 }}>
        <div ref={printAreaRef}>
          {printRows.map((row) => (
            <div key={row.payrollId} style={{ pageBreakAfter: "always" }}>
              <PayslipTemplate
                yearMonth={row.yearMonth}
                employeeName={row.employeeName}
                department={storeName}
                basePay={row.baseWage ?? 0}
                grossPay={row.grossPay ?? 0}
                deductions={row.deductions ?? 0}
                netPay={row.netPay ?? 0}
                workDays={row.workDays ?? 0}
                workHours={(row.workMinutes ?? 0) / 60.0}
                wageType={row.wageType ?? undefined}
                deductionType={row.deductionType ?? undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
