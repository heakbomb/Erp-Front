"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Search } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip"
import { Switch } from "@/shared/ui/switch"

import PayrollCalcDialog from "./PayrollCalcDialog"
import {
  fetchMonthlyPayrollHistory,
  updatePayrollStatus,
  fetchPayrollRunStatus,
  type PayrollHistoryDetail,
  type PayrollRunStatusRes,
} from "./payrollApi"

type EmployeePayrollRow = {
  id: number
  name: string
  role: string
  workDays: number
  workHours: number
  basePay: number
  bonus: number
  deductions: number
  netPay: number
  status: string
}

type Props = {
  monthLabel: string
  loading: boolean
  searchQuery: string
  setSearchQuery: (v: string) => void
  filteredEmployees: EmployeePayrollRow[]
  employeesCount: number
  totalWorkHours: number
  totalPayroll: number
  showNetPay: boolean
  onCalcFinished: () => void
  storeId: number
}

export default function CurrentPayrollTab({
  monthLabel,
  loading,
  searchQuery,
  setSearchQuery,
  filteredEmployees,
  employeesCount,
  totalWorkHours,
  totalPayroll,
  showNetPay,
  onCalcFinished,
  storeId,
}: Props) {
  const [isCalcOpen, setIsCalcOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [statusMap, setStatusMap] = useState<Record<number, { payrollId: number; status: string }>>({})
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)
  const [runStatus, setRunStatus] = useState<PayrollRunStatusRes | null>(null)

  const yearMonthKey = useMemo(() => {
    const match = monthLabel.match(/(\d{4})년\s*(\d{1,2})월/)
    if (!match) return ""
    return `${match[1]}-${match[2].padStart(2, "0")}`
  }, [monthLabel])

  const isPastMonth = useMemo(() => {
    const now = new Date()
    const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    return yearMonthKey < currentYm
  }, [yearMonthKey])

  const isFinalized = runStatus?.status === "FINALIZED"
  const calcDisabled = isPastMonth || isFinalized

  useEffect(() => {
    if (!storeId || !yearMonthKey) return
    fetchPayrollRunStatus({ storeId, yearMonth: yearMonthKey })
      .then(setRunStatus)
      .catch(() => setRunStatus(null))
  }, [storeId, yearMonthKey, historyRefreshKey])

  useEffect(() => {
    if (!storeId || !yearMonthKey) return
    const run = async () => {
      setHistoryLoading(true)
      try {
        const data = await fetchMonthlyPayrollHistory({ storeId, yearMonth: yearMonthKey })
        const map: Record<number, { payrollId: number; status: string }> = {}
        data.forEach((h) => { map[h.employeeId] = { payrollId: h.payrollId, status: h.status } })
        setStatusMap(map)
      } catch (e) { console.error(e) } 
      finally { setHistoryLoading(false) }
    }
    run()
  }, [storeId, yearMonthKey, historyRefreshKey])

  const handleCalcFinished = () => {
    onCalcFinished()
    setHistoryRefreshKey((v) => v + 1)
  }

  const setIsCalcOpenSafe = (v: boolean) => {
    if (v && calcDisabled) {
      alert("자동 계산을 실행할 수 없습니다 (마감/지난달).")
      return
    }
    setIsCalcOpen(v)
  }

  const handleToggleStatus = async (employeeId: number) => {
    const info = statusMap[employeeId]
    if (!info) {
      alert("먼저 '급여 자동 계산'을 실행해 주세요.")
      return
    }
    const current = info.status === "PAID" || info.status === "지급완료" ? "PAID" : "PENDING"
    const next = current === "PAID" ? "PENDING" : "PAID"
    try {
      const updated = await updatePayrollStatus({ payrollId: info.payrollId, status: next })
      setStatusMap((prev) => ({ ...prev, [employeeId]: { payrollId: info.payrollId, status: updated.status } }))
    } catch { alert("상태 변경 실패") }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div><CardTitle>{monthLabel} 급여 내역</CardTitle><CardDescription>직원별 급여 상세 내역</CardDescription></div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <PayrollCalcDialog
              monthLabel={monthLabel}
              employeesCount={employeesCount}
              totalWorkHours={totalWorkHours}
              totalPayroll={totalPayroll}
              isOpen={isCalcOpen}
              setIsOpen={setIsCalcOpenSafe}
              loading={loading}
              onCalcFinished={handleCalcFinished}
              storeId={storeId}
            />
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="직원 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <p>로딩 중...</p> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead><TableHead>역할</TableHead><TableHead>근무일수</TableHead><TableHead>근무시간</TableHead><TableHead>기본급</TableHead>
                <TableHead>공제액</TableHead><TableHead>실수령액</TableHead><TableHead>급여지급상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => {
                const statusInfo = statusMap[employee.id]
                const effectiveStatus = statusInfo?.status ?? employee.status
                const paid = effectiveStatus === "PAID" || effectiveStatus === "지급완료"
                return (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.name}</TableCell><TableCell>{employee.role}</TableCell>
                    <TableCell>{employee.workDays}일</TableCell><TableCell>{employee.workHours}시간</TableCell>
                    <TableCell>₩{employee.basePay.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600">{showNetPay ? `-₩${employee.deductions.toLocaleString()}` : "-₩0"}</TableCell>
                    <TableCell className="font-medium">{showNetPay ? `₩${employee.netPay.toLocaleString()}` : "₩0"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={paid} disabled={historyLoading} onCheckedChange={() => handleToggleStatus(employee.id)} />
                        <span className="text-xs text-muted-foreground">{paid ? "지급완료" : "예정"}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}