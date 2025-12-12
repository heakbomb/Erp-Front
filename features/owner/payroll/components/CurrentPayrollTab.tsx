// features/owner/payroll/components/CurrentPayrollTab.tsx
"use client"

import { useState, useEffect, useMemo } from "react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Switch } from "@/components/ui/switch"

import PayrollCalcDialog from "@/features/owner/payroll/components/PayrollCalcDialog"
import {
  fetchMonthlyPayrollHistory,
  updatePayrollStatus,
  type PayrollHistoryDetail,
} from "@/features/owner/payroll/services/payrollHistoryService"

import { apiClient } from "@/lib/api/client" // ✅ (추가) run 상태 조회 API 호출용

// 🔥 payrollId는 history에서 가져올 거라 선택적(optional)로 둠
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

type PayrollRunStatusRes = {
  exists: boolean
  status: string // "DRAFT" | "FINALIZED" | "FAILED" | "NONE"
  finalizedAt?: string | null
  source?: string | null
  version?: number
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

  // 🔥 history detail (payroll_history 테이블 내용)
  const [historyDetails, setHistoryDetails] = useState<PayrollHistoryDetail[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // 🔥 토글 후 UI 갱신용 맵: employeeId → { payrollId, status }
  const [statusMap, setStatusMap] = useState<
    Record<number, { payrollId: number; status: string }>
  >({})

  // 🔥 급여 자동 계산 끝난 뒤 history 다시 불러오기 위한 키
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)

  // ✅ (추가) payroll_run 상태
  const [runStatus, setRunStatus] = useState<PayrollRunStatusRes | null>(null)

  // "2025년 12월" → "2025-12"
  const yearMonthKey = useMemo(() => {
    const match = monthLabel.match(/(\d{4})년\s*(\d{1,2})월/)
    if (!match) return ""
    const year = match[1]
    const month = match[2].padStart(2, "0")
    return `${year}-${month}`
  }, [monthLabel])

  // ✅ (추가) 현재 월 "yyyy-MM"
  const currentYm = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, "0")
    return `${y}-${m}`
  }, [])

  // ✅ (추가) 지난달이면 true (문자열 yyyy-MM 비교는 정상 동작)
  const isPastMonth = useMemo(() => {
    if (!yearMonthKey) return false
    return yearMonthKey < currentYm
  }, [yearMonthKey, currentYm])

  // ✅ (추가) run.status FINALIZED 여부
  const isFinalized = useMemo(() => {
    return runStatus?.status === "FINALIZED"
  }, [runStatus])

  // ✅ (추가) 자동계산 버튼/다이얼로그 진입 금지 조건
  const calcDisabled = useMemo(() => {
    return isPastMonth || isFinalized
  }, [isPastMonth, isFinalized])

  // ✅ (추가) 왜 막히는지 안내 문구
  const calcDisabledReason = useMemo(() => {
    if (isFinalized) return "이미 마감(FINALIZED)된 월이라 자동 계산이 불가합니다."
    if (isPastMonth) return "지난달 급여는 마감 처리되어 자동 계산이 불가합니다."
    return ""
  }, [isFinalized, isPastMonth])

  // ✅ (추가) payroll_run 상태 조회
  useEffect(() => {
    if (!storeId || !yearMonthKey) return

    let mounted = true

    const fetchRun = async () => {
      try {
        const res = await apiClient.get<PayrollRunStatusRes>("/owner/payroll/history/run", {
          params: { storeId, yearMonth: yearMonthKey },
        })
        if (!mounted) return
        setRunStatus(res.data ?? null)
      } catch (e) {
        // run 조회 실패해도 화면은 동작해야 함 (상태는 null 유지)
        if (!mounted) return
        setRunStatus(null)
        console.error("payroll_run 상태 조회 실패:", e)
      }
    }

    fetchRun()

    return () => {
      mounted = false
    }
  }, [storeId, yearMonthKey, historyRefreshKey]) // historyRefreshKey로 재계산 후에도 run 재조회

  // 🔥 history detail 조회
  useEffect(() => {
    if (!storeId || !yearMonthKey) return

    let mounted = true

    const run = async () => {
      try {
        setHistoryLoading(true)
        const data = await fetchMonthlyPayrollHistory({
          storeId,
          yearMonth: yearMonthKey,
        })

        if (!mounted) return

        setHistoryDetails(data ?? [])

        // employeeId → { payrollId, status } 맵 구성
        const map: Record<number, { payrollId: number; status: string }> = {}
        data.forEach((h) => {
          map[h.employeeId] = { payrollId: h.payrollId, status: h.status }
        })
        setStatusMap(map)
      } catch (e) {
        console.error("급여 지급 내역(history) 조회 실패:", e)
      } finally {
        if (mounted) setHistoryLoading(false)
      }
    }

    run()

    return () => {
      mounted = false
    }
  }, [storeId, yearMonthKey, historyRefreshKey])

  // 🔥 급여 자동 계산 완료 시: 부모 콜백 + history 다시 불러오기 트리거
  const handleCalcFinished = () => {
    onCalcFinished()
    setHistoryRefreshKey((v) => v + 1)
  }

  // ✅ (추가) 다이얼로그 open 제어를 안전하게(막힘 조건이면 열지 않음)
  const setIsCalcOpenSafe = (v: boolean) => {
    if (v && calcDisabled) {
      alert(calcDisabledReason || "자동 계산을 실행할 수 없습니다.")
      return
    }
    setIsCalcOpen(v)
  }

  // 상태 라벨
  const getStatusLabel = (status: string) => {
    if (status === "PAID" || status === "지급완료") return "지급완료"
    return "예정"
  }

  // 토글용 boolean
  const isPaid = (status: string) =>
    status === "PAID" || status === "지급완료"

  // 🔥 토글 클릭 시: DB에 상태 저장 + 로컬 map 갱신
  const handleToggleStatus = async (employeeId: number) => {
    const info = statusMap[employeeId]

    if (!info) {
      alert("먼저 상단에서 '급여 자동 계산'을 실행해 급여 지급 내역을 저장해 주세요.")
      return
    }

    const current = info.status === "PAID" || info.status === "지급완료" ? "PAID" : "PENDING"
    const next = current === "PAID" ? "PENDING" : "PAID"

    try {
      const updated = await updatePayrollStatus({
        payrollId: info.payrollId,
        status: next,
      })

      setStatusMap((prev) => ({
        ...prev,
        [employeeId]: {
          payrollId: info.payrollId,
          status: updated.status,
        },
      }))
    } catch (e) {
      console.error("급여지급상태 변경 실패:", e)
      alert("급여지급상태 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.")
    }
  }

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
              setIsOpen={setIsCalcOpenSafe} // ✅ (변경) 막힘 조건이면 열리지 않게
              loading={loading} // 기존 그대로
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
          <p className="text-sm text-muted-foreground">급여 데이터를 불러오는 중입니다…</p>
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
                <TableHead>
                  <div className="flex items-center gap-1">
                    <span>실수령액</span>

                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="
                              flex h-4 w-4 items-center justify-center
                              rounded-full border border-muted-foreground
                              text-[11px] font-semibold leading-none
                              text-muted-foreground hover:bg-muted
                            "
                          >
                            i
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-[200px] text-center">
                          상단 ‘급여 자동 계산’ 실행 후 계산된 실수령액이 표시됩니다.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
                <TableHead>급여지급상태</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredEmployees.map((employee) => {
                const statusInfo = statusMap[employee.id]
                const effectiveStatus = statusInfo?.status ?? employee.status
                const paid = isPaid(effectiveStatus)

                return (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>{employee.workDays}일</TableCell>
                    <TableCell>{employee.workHours}시간</TableCell>
                    <TableCell>₩{employee.basePay.toLocaleString()}</TableCell>

                    {/* ✅ 자동 계산 전에는 공제액도 0으로 숨김 */}
                    <TableCell className="text-red-600">
                      {showNetPay
                        ? `-₩${employee.deductions.toLocaleString()}`
                        : "-₩0"}
                    </TableCell>

                    <TableCell className="font-medium text-muted-foreground">
                      {showNetPay ? `₩${employee.netPay.toLocaleString()}` : "₩0"}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={paid}
                          disabled={historyLoading}
                          onCheckedChange={() => handleToggleStatus(employee.id)}
                        />
                        <span
                          className="
                            text-xs font-medium text-muted-foreground
                            inline-flex w-[64px]
                          "
                        >
                          {getStatusLabel(effectiveStatus)}
                        </span>
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