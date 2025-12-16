// features/owner/payroll/services/payrollHistoryService.ts
import { apiClient } from "@/shared/api/apiClient"

export type PayrollHistoryDetail = {
  payrollId: number
  employeeId: number
  employeeName: string
  role: string | null
  yearMonth: string
  workDays: number
  workMinutes: number
  grossPay: number
  deductions: number
  netPay: number
  wageType: string | null
  baseWage: number | null
  deductionType: string | null
  status: string
  paidAt: string | null
}

/**
 * 이번 달 급여를 history 테이블에 저장/업데이트
 * POST /owner/payroll/history/save
 */
export async function saveMonthlyPayrollHistory(params: {
  storeId: number
  yearMonth: string   // "2025-12"
}): Promise<PayrollHistoryDetail[]> {
  const { storeId, yearMonth } = params

  const res = await apiClient.post<PayrollHistoryDetail[]>(
    "/owner/payroll/history/save",
    null,
    {
      params: { storeId, yearMonth },
    },
  )

  return res.data
}

/**
 * 특정 월의 지급 내역 조회
 * GET /owner/payroll/history
 */
export async function fetchMonthlyPayrollHistory(params: {
  storeId: number
  yearMonth: string
}): Promise<PayrollHistoryDetail[]> {
  const { storeId, yearMonth } = params

  const res = await apiClient.get<PayrollHistoryDetail[]>(
    "/owner/payroll/history",
    {
      params: { storeId, yearMonth },
    },
  )

  return res.data
}

// 급여 지급 상태 업데이트
export async function updatePayrollStatus(params: {
  payrollId: number
  status: "PENDING" | "PAID" | "예정" | "지급완료"
}): Promise<PayrollHistoryDetail> {
  const { payrollId, status } = params

  const res = await apiClient.patch<PayrollHistoryDetail>(
    `/owner/payroll/history/${payrollId}/status`,
    null,
    { params: { status } },
  )

  return res.data
}

export type PayrollHistorySummary = {
  month: string
  totalPaid: number
  employees: number
  status: string
}

export async function fetchPayrollHistorySummary(params: {
  storeId: number
}): Promise<PayrollHistorySummary[]> {
  const { storeId } = params

  const res = await apiClient.get<PayrollHistorySummary[]>(
    "/owner/payroll/history/summary",
    { params: { storeId } },
  )

  return res.data
}
