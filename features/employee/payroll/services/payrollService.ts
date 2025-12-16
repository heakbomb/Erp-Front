// features/employee/payroll/services/payrollService.ts
import { apiClient } from "@/shared/api/apiClient"

/* ---------- 백엔드 DTO 타입 ---------- */

export type BackendPayrollHistoryDetailDto = {
  payrollId: number
  employeeId: number
  employeeName: string
  storeName?: string        // ✅ 백엔드에서 내려주는 사업장 이름
  yearMonth: string         // "2025-12"
  workDays: number
  workMinutes: number
  grossPay: number
  deductions: number
  netPay: number
  wageType?: string         // "HOURLY" | "MONTHLY"
  baseWage: number
  deductionType?: string    // "FOUR_INSURANCE" | "TAX_3_3" ...
  status: string            // "PAID" / "PENDING" 등
  paidAt?: string | null
}

/* ---------- 직원 페이지에서 쓰는 타입 ---------- */

export type PayrollRecord = {
  month: string            // "2025년 12월"
  basePay: number
  bonus: number
  deductions: number
  netPay: number
  status: string
  paidDate: string
  wageType?: string
  deductionType?: string
  workDays: number
  workHours: number
  employeeName?: string
  storeName?: string
}

export type CurrentPayrollSummary = {
  titleMonth: string       // "2025년 12월 (PAID)"
  basePay: string          // "₩1,440,000"
  bonus: string            // "₩0"
  deductions: string       // "-₩50,000"
  netPay: string           // "₩1,390,000"
}

export type EmployeePayrollData = {
  currentWorkplace: string
  currentSummary: CurrentPayrollSummary
  history: PayrollRecord[]
}

/* ---------- 유틸 ---------- */

const formatCurrency = (value: number) => `₩${value.toLocaleString()}`

// TODO: 로그인 붙으면 교체
const MOCK_STORE_ID = 11
const MOCK_EMPLOYEE_ID = 3

/* ---------- 직원 급여 이력 실제 호출 ---------- */

export async function fetchEmployeePayrollData(): Promise<EmployeePayrollData> {
  const res = await apiClient.get<BackendPayrollHistoryDetailDto[]>(
    "/employee/payroll/history",
    {
      params: {
        storeId: MOCK_STORE_ID,
        employeeId: MOCK_EMPLOYEE_ID,
      },
    },
  )

  const items = res.data ?? []

  // 이력이 아예 없는 경우
  if (!items.length) {
    return {
      currentWorkplace: "현재 사업장",
      currentSummary: {
        titleMonth: "급여 이력 없음",
        basePay: formatCurrency(0),
        bonus: formatCurrency(0),
        deductions: formatCurrency(0),
        netPay: formatCurrency(0),
      },
      history: [],
    }
  }

  // 백엔드에서 최근 월 순으로 내려온다고 가정 → 첫번째가 최신
  const latest = items[0]

  // ✅ 여기서 실제 사업장 이름 사용
  const currentWorkplace = latest.storeName ?? "현재 사업장"

  const history: PayrollRecord[] = items.map((h) => {
    const bonus = h.grossPay - h.baseWage

    return {
      month: h.yearMonth.replace("-", "년 ") + "월",
      basePay: h.baseWage,
      bonus: bonus > 0 ? bonus : 0,
      deductions: h.deductions,
      netPay: h.netPay,
      status: h.status,
      paidDate: h.paidAt ?? "-",
      wageType: h.wageType,
      deductionType: h.deductionType,
      workDays: h.workDays,
      workHours: Math.round((h.workMinutes / 60) * 10) / 10,
      employeeName: h.employeeName,
      storeName: h.storeName,
    }
  })

  const latestMonthLabel = latest.yearMonth.replace("-", "년 ") + "월"
  const bonusLatest = latest.grossPay - latest.baseWage

  const currentSummary: CurrentPayrollSummary = {
    titleMonth: `${latestMonthLabel} (${latest.status})`,
    basePay: formatCurrency(latest.baseWage),
    bonus: formatCurrency(bonusLatest > 0 ? bonusLatest : 0),
    deductions: `-${formatCurrency(latest.deductions).replace("₩", "")}`,
    netPay: formatCurrency(latest.netPay),
  }

  return {
    currentWorkplace,
    currentSummary,
    history,
  }
}