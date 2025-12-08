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

// ✅ 실제 API 연동용 함수
export async function fetchOwnerPayroll(params: {
  storeId: number
  month: string // "yyyy-MM"
}): Promise<OwnerPayrollData> {
  const res = await apiClient.get<OwnerPayrollData>("/owner/payroll", {
    params: {
      storeId: params.storeId,
      yearMonth: params.month, // ← 여기 중요!
    },
  })

  return res.data
}