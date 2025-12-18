"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { useStore } from "@/contexts/StoreContext"

import {
  fetchMonthlyPayrollHistory,
  fetchPayrollHistorySummary,
  type PayrollHistoryDetail,
  type PayrollHistorySummary,
} from "./payrollApi" // 로컬 API

export default function PayrollHistoryTab() {
  const { currentStoreId } = useStore()

  const [summary, setSummary] = useState<PayrollHistorySummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterMonth, setFilterMonth] = useState<string>("")

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [details, setDetails] = useState<PayrollHistoryDetail[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    if (!currentStoreId) return
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchPayrollHistorySummary({ storeId: currentStoreId })
        setSummary(data ?? [])
      } catch (e: any) {
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

  const handleOpenDetail = async (month: string) => {
    if (!currentStoreId) return
    setSelectedMonth(month)
    setIsDetailOpen(true)
    setDetailLoading(true)
    setDetailError(null)
    try {
      const data = await fetchMonthlyPayrollHistory({ storeId: currentStoreId, yearMonth: month })
      setDetails(data ?? [])
    } catch (e) {
      setDetailError("지급 내역을 불러오지 못했습니다.")
      setDetails([])
    } finally {
      setDetailLoading(false)
    }
  }

  const formatWorkHours = (minutes: number) => {
    if (!minutes) return "0시간"
    return `${(minutes / 60).toFixed(1)}시간`
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>급여 지급 내역</CardTitle>
              <CardDescription>월별로 저장된 급여 지급 기록을 확인하고, 직원별 상세 내역을 조회할 수 있습니다.</CardDescription>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">조회 월</span>
                <Input type="month" className="w-[160px]" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />
              </div>
              <Button type="button" variant="ghost" className="h-9 text-xs" onClick={() => setFilterMonth("")}>전체 보기</Button>
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
                      <Badge variant="default" className="mt-1">{record.status}</Badge>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleOpenDetail(record.month)}>상세 보기</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[90vw] max-w-[1200px] max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{selectedMonth} 급여 지급 상세 내역</DialogTitle>
            <DialogDescription>선택한 월의 직원별 지급 내역을 확인합니다.</DialogDescription>
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
                    <TableHead>이름</TableHead><TableHead>역할</TableHead><TableHead>근무일수</TableHead><TableHead>근무시간</TableHead>
                    <TableHead>총지급액</TableHead><TableHead>공제액</TableHead><TableHead>실수령액</TableHead><TableHead>지급상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.map((row) => (
                    <TableRow key={row.payrollId}>
                      <TableCell>{row.employeeName}</TableCell><TableCell>{row.role}</TableCell>
                      <TableCell>{row.workDays}일</TableCell><TableCell>{formatWorkHours(row.workMinutes)}</TableCell>
                      <TableCell>₩{row.grossPay.toLocaleString()}</TableCell>
                      <TableCell className="text-red-600">-₩{row.deductions.toLocaleString()}</TableCell>
                      <TableCell className="font-bold text-primary">₩{row.netPay.toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline">{row.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}