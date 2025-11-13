import axios from "axios"

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080"

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

// ───── 현재 page.tsx에 있던 목 데이터 그대로 이동 ─────
export const MOCK_EMPLOYEE_PAYROLL: EmployeePayroll[] = [
  {
    id: 1,
    name: "김직원",
    role: "주방",
    workDays: 22,
    workHours: 176,
    hourlyWage: 10000,
    basePay: 1760000,
    bonus: 100000,
    deductions: 88000,
    netPay: 1772000,
    status: "확정",
  },
  {
    id: 2,
    name: "이직원",
    role: "홀",
    workDays: 20,
    workHours: 160,
    hourlyWage: 10000,
    basePay: 1600000,
    bonus: 0,
    deductions: 80000,
    netPay: 1520000,
    status: "확정",
  },
  {
    id: 3,
    name: "박직원",
    role: "주방",
    workDays: 18,
    workHours: 144,
    hourlyWage: 10000,
    basePay: 1440000,
    bonus: 50000,
    deductions: 72000,
    netPay: 1418000,
    status: "확정",
  },
]

export const MOCK_PAYROLL_HISTORY: PayrollHistory[] = [
  { month: "2024년 3월", totalPaid: 4_850_000, employees: 12, status: "지급완료" },
  { month: "2024년 2월", totalPaid: 4_620_000, employees: 12, status: "지급완료" },
  { month: "2024년 1월", totalPaid: 5_120_000, employees: 12, status: "지급완료" },
]

// ───── 나중에 백엔드 붙일 때 이 함수만 교체하면 됨 ─────
export async function fetchOwnerPayroll(): Promise<OwnerPayrollData> {
  // TODO: 실제 API 연동 시 아래 사용
  // const res = await axios.get<OwnerPayrollData>(`${API_BASE}/api/owner/payroll`)
  // return res.data

  return {
    employees: MOCK_EMPLOYEE_PAYROLL,
    history: MOCK_PAYROLL_HISTORY,
  }
}