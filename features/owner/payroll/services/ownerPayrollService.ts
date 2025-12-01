// features/owner/payroll/services/ownerPayrollService.ts
import { apiClient } from "@/lib/api/client"

export type EmployeePayroll = {
  id: number
  name: string
  role: string
  workDays: number
  workHours: number
  hourlyWage: number
  basePay: number
  bonus: number
  deductions: number
  netPay: number
  status: string
}

export type PayrollHistory = {
  month: string
  totalPaid: number
  employees: number
  status: string
}

export type OwnerPayrollData = {
  employees: EmployeePayroll[]
  history: PayrollHistory[]
}

// (원래 있던 MOCK_*는 필요하면 남겨두고, 실제 화면은 API 응답 사용)
export const MOCK_EMPLOYEE_PAYROLL: EmployeePayroll[] = [/* ... 생략 ... */]
export const MOCK_PAYROLL_HISTORY: PayrollHistory[] = [/* ... 생략 ... */]

// ✅ 실제 API 연동용 함수
export async function fetchOwnerPayroll(params: {
  storeId: number
  month: string // "yyyy-MM"
}): Promise<OwnerPayrollData> {
  const res = await apiClient.get<OwnerPayrollData>("/owner/payroll", {
    params,
  })
  return res.data
}