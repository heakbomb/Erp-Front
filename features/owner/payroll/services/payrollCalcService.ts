import { apiClient } from "@/shared/api/apiClient"
import { extractErrorMessage as utilExtractErrorMessage } from "@/shared/utils/commonUtils"

// 백엔드 OwnerPayrollResponse.EmployeePayroll 과 맞춰서 타입 정의
export type PayrollCalcEmployee = {
  id: number
  name: string
  role: string
  workDays: number
  workHours: number
  basePay: number      // 기본급/총지급액
  deductions: number   // 공제액
  netPay: number       // 실수령액
  deductionType?: string // 🔥 "FOUR_INSURANCE" | "TAX_3_3" | "NONE"
}

// 🔥 백엔드 PayrollCalcResultDto 와 구조를 맞춰줌
export type PayrollCalcResult = {
  totalWorkMinutes: number
  totalGrossPay: number
  totalDeductions: number
  totalNetPay: number
  employees: PayrollCalcEmployee[]
}

export function extractErrorMessage(e: any): string {
  return utilExtractErrorMessage(e)
}

/**
 * ✅ 급여 자동 계산 API 호출
 * POST /owner/payroll/calc?storeId=11&yearMonth=2025-12
 */
export async function calculatePayroll(params: {
  storeId: number
  yearMonth: string
}): Promise<PayrollCalcResult> {
  const { storeId, yearMonth } = params

  const res = await apiClient.post<PayrollCalcResult>(
    "/owner/payroll/calc",
    null,
    {
      params: { storeId, yearMonth },
    },
  )

  return res.data
}