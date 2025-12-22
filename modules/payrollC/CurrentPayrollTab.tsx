"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Search } from "lucide-react"
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
  const [historyRows, setHistoryRows] = useState<EmployeePayrollRow[]>([])
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)

  const [runStatus, setRunStatus] = useState<PayrollRunStatusRes | null>(null)

  // "2025년 11월" → "2025-11"
  const yearMonthKey = useMemo(() => {
    const match = monthLabel.match(/(\d{4})년\s*(\d{1,2})월/)
    if (!match) return ""
    return `${match[1]}-${match[2].padStart(2, "0")}`
  }, [monthLabel])

  const isPastMonth = useMemo(() => {
    if (!yearMonthKey) return false
    const now = new Date()
    const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    return yearMonthKey < currentYm
  }, [yearMonthKey])

  // 마감 여부
  useEffect(() => {
    if (!storeId || !yearMonthKey) return
    fetchPayrollRunStatus({ storeId, yearMonth: yearMonthKey })
      .then(setRunStatus)
      .catch(() => setRunStatus(null))
  }, [storeId, yearMonthKey, historyRefreshKey])

  const isFinalized = runStatus?.status === "FINALIZED"
  const calcDisabled = isPastMonth || isFinalized

  // ✅ 히스토리 가져와서
  // - statusMap 채우고
  // - (과거월일 때는) 테이블 row 데이터(historyRows)까지 생성
  useEffect(() => {
    if (!storeId || !yearMonthKey) return

    const run = async () => {
      setHistoryLoading(true)
      try {
        const data = await fetchMonthlyPayrollHistory({ storeId, yearMonth: yearMonthKey })

        // 1) statusMap 구성(토글용)
        const map: Record<number, { payrollId: number; status: string }> = {}
        data.forEach((h) => {
          map[h.employeeId] = { payrollId: h.payrollId, status: h.status }
        })
        setStatusMap(map)

        // 2) 과거월이면 히스토리로 테이블 렌더링
        if (isPastMonth) {
          const rows: EmployeePayrollRow[] = data.map((h: PayrollHistoryDetail) => {
            const workHours = Math.round(((h.workMinutes ?? 0) / 60) * 100) / 100 // 소수 2자리
            const basePay = h.baseWage ?? 0
            const grossPay = h.grossPay ?? 0
            const deductions = h.deductions ?? 0
            const netPay = h.netPay ?? 0

            return {
              id: h.employeeId,
              name: h.employeeName,
              role: h.role ?? "STAFF",
              workDays: h.workDays ?? 0,
              workHours,
              basePay, // 화면 컬럼이 "기본급"이라 baseWage를 노출
              bonus: Math.max(grossPay - basePay, 0),
              deductions,
              netPay,
              status: h.status,
            }
          })

          // 직원명 기준 정렬(원하면 id 정렬로 바꿔도 됨)
          rows.sort((a, b) => a.name.localeCompare(b.name, "ko"))
          setHistoryRows(rows)
        } else {
          setHistoryRows([])
        }
      } catch (e) {
        console.error(e)
        setStatusMap({})
        setHistoryRows([])
      } finally {
        setHistoryLoading(false)
      }
    }

    run()
  }, [storeId, yearMonthKey, historyRefreshKey, isPastMonth])

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
      setStatusMap((prev) => ({
        ...prev,
        [employeeId]: { payrollId: info.payrollId, status: updated.status },
      }))

      // ✅ 과거월 렌더링 중이면 row에도 반영
      if (isPastMonth) {
        setHistoryRows((prev) =>
          prev.map((r) => (r.id === employeeId ? { ...r, status: updated.status } : r)),
        )
      }
    } catch {
      alert("상태 변경 실패")
    }
  }

  // ✅ 실제 테이블에 뿌릴 데이터:
  // - 과거월이면 historyRows(히스토리 기반)
  // - 현재/미래월이면 filteredEmployees(기존 계산 기반)
  const tableRows = useMemo(() => {
    const source = isPastMonth ? historyRows : filteredEmployees
    if (!searchQuery.trim()) return source
    const q = searchQuery.trim().toLowerCase()
    return source.filter((r) => r.name.toLowerCase().includes(q))
  }, [isPastMonth, historyRows, filteredEmployees, searchQuery])

  // ✅ 과거월은 이미 확정된 값이므로 실수령/공제는 항상 보여주기
  const effectiveShowNetPay = showNetPay || isPastMonth

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>{monthLabel} 급여 내역</CardTitle>
            <CardDescription>직원별 급여 상세 내역</CardDescription>
          </div>

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
              <Input
                placeholder="직원 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>근무일수</TableHead>
                <TableHead>근무시간</TableHead>
                <TableHead>기본급</TableHead>
                <TableHead>공제액</TableHead>
                <TableHead>실수령액</TableHead>
                <TableHead>급여지급상태</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {tableRows.map((employee) => {
                const statusInfo = statusMap[employee.id]
                const effectiveStatus = statusInfo?.status ?? employee.status
                const paid = effectiveStatus === "PAID" || effectiveStatus === "지급완료"

                return (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.role}</TableCell>

                    <TableCell>{employee.workDays}일</TableCell>
                    <TableCell>{employee.workHours}시간</TableCell>

                    <TableCell>₩{employee.basePay.toLocaleString()}</TableCell>

                    <TableCell className="text-red-600">
                      {effectiveShowNetPay ? `-₩${employee.deductions.toLocaleString()}` : "-₩0"}
                    </TableCell>

                    <TableCell className="font-medium">
                      {effectiveShowNetPay ? `₩${employee.netPay.toLocaleString()}` : "₩0"}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={paid}
                          disabled={historyLoading}
                          onCheckedChange={() => handleToggleStatus(employee.id)}
                        />
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
