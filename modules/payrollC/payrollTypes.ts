// modules/payrollC/payrollTypes.ts

/* =========================================
   [공통] 기본 타입
   ========================================= */
export type WageType = "HOURLY" | "MONTHLY"
export type DeductionType = "NONE" | "FOUR_INSURANCE" | "TAX_3_3"
export type PayrollStatus = "PENDING" | "PAID" | "예정" | "지급완료"

/* =========================================
   [사장님] 급여 설정 (Settings)
   ========================================= */
export interface PayrollSetting {
  settingId: number | null
  employeeId: number
  employeeName: string
  role?: string // 백엔드 DTO 상황에 따라 optional
  baseWage: number
  wageType: string // "HOURLY" | "MONTHLY"
  deductionType?: DeductionType
  deductionRate?: number | null
}

/* =========================================
   [사장님] 급여 현황 (Main Dashboard)
   ========================================= */
export interface EmployeePayroll {
  id: number
  name: string
  role: string
  workDays: number
  workHours: number
  hourlyWage: number // 일부 DTO에서 사용
  basePay: number
  bonus: number
  deductions: number
  netPay: number
  status: string
}

export interface PayrollHistory {
  month: string
  totalPaid: number
  employees: number
  status: string
}

export interface OwnerPayrollData {
  employees: EmployeePayroll[]
  history: PayrollHistory[]
}

/* =========================================
   [사장님] 급여 자동 계산 (Calculation)
   ========================================= */
export interface PayrollCalcEmployee {
  id: number
  name: string
  role: string
  workDays: number
  workHours: number
  basePay: number
  deductions: number
  netPay: number
  deductionType?: string
}

export interface PayrollCalcResult {
  totalWorkMinutes: number
  totalGrossPay: number
  totalDeductions: number
  totalNetPay: number
  employees: PayrollCalcEmployee[]
}

/* =========================================
   [사장님] 급여 지급 내역 (History Detail)
   ========================================= */
export interface PayrollHistoryDetail {
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

export interface PayrollHistorySummary {
  month: string
  totalPaid: number
  employees: number
  status: string
}

// 마감(Run) 상태 확인용
export interface PayrollRunStatusRes {
  exists: boolean
  status: string // "DRAFT" | "FINALIZED" | "FAILED" | "NONE"
  finalizedAt?: string | null
  source?: string | null
  version?: number
}

/* =========================================
   [직원] 급여 조회 (Employee View)
   ========================================= */
export type BackendPayrollHistoryDetailDto = {
  payrollId: number
  employeeId: number
  employeeName: string
  storeName?: string
  yearMonth: string
  workDays: number
  workMinutes: number
  grossPay: number
  deductions: number
  netPay: number
  wageType?: string
  baseWage: number
  deductionType?: string
  status: string
  paidAt?: string | null
}

export type PayrollRecord = {
  month: string
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
  titleMonth: string
  basePay: string
  bonus: string
  deductions: string
  netPay: string
}

export type EmployeePayrollData = {
  currentWorkplace: string
  currentSummary: CurrentPayrollSummary
  history: PayrollRecord[]
}