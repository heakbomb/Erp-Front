// modules/payrollC/payrollApi.ts
import { apiClient } from "@/shared/api/apiClient"

// ✅ 타입들을 재-export 하여 다른 파일에서 payrollApi.ts 만 import 해도 쓸 수 있게 함
export type {
  OwnerPayrollData,
  PayrollSetting,
  PayrollCalcResult,
  PayrollHistoryDetail,
  PayrollHistorySummary,
  PayrollRunStatusRes,
  BackendPayrollHistoryDetailDto,
  EmployeePayrollData,
  PayrollRecord,
  CurrentPayrollSummary,
  EmployeePayroll, // OwnerPayrollView 등에서 사용
  PayrollHistory,   // useOwnerPayroll 등에서 사용
} from "./payrollTypes"

import type {
  OwnerPayrollData,
  PayrollSetting,
  PayrollCalcResult,
  PayrollHistoryDetail,
  PayrollHistorySummary,
  PayrollRunStatusRes,
  BackendPayrollHistoryDetailDto,
  EmployeePayrollData,
  PayrollRecord,
  CurrentPayrollSummary,
} from "./payrollTypes"

/* =========================================
   [사장님] 급여 관리 API
   ========================================= */

// 1. 월별 급여 현황 조회 (메인)
export async function fetchOwnerPayroll(params: {
  storeId: number
  month: string // "yyyy-MM"
}): Promise<OwnerPayrollData> {
  const res = await apiClient.get<OwnerPayrollData>("/owner/payroll", {
    params: {
      storeId: params.storeId,
      yearMonth: params.month,
    },
  })
  return res.data
}

// 2. 급여 설정 조회
export async function fetchPayrollSettings(storeId: number): Promise<PayrollSetting[]> {
  const res = await apiClient.get<PayrollSetting[]>("/owner/payroll/settings", {
    params: { storeId },
  })
  return res.data || []
}

// 3. 급여 설정 저장 (단건)
export async function savePayrollSetting(params: {
  storeId: number
  employeeId: number
  baseWage: number
  wageType: string
  deductionType: string
  deductionRate: number | null
}): Promise<PayrollSetting> {
  const { storeId, employeeId, ...body } = params
  const res = await apiClient.put<PayrollSetting>(
    `/owner/payroll/settings/${employeeId}`,
    body,
    {
      params: { storeId },
    },
  )
  return res.data
}

// 4. 급여 자동 계산
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

// 5. 급여 내역 저장 (계산 확정)
export async function saveMonthlyPayrollHistory(params: {
  storeId: number
  yearMonth: string
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

// 6. 월별 지급 내역 상세 조회
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

// 7. 급여 지급 상태 변경
export async function updatePayrollStatus(params: {
  payrollId: number
  status: string
}): Promise<{ status: string }> {
  const { payrollId, status } = params
  const res = await apiClient.patch<{ status: string }>(
    `/owner/payroll/history/${payrollId}/status`,
    null,
    { params: { status } },
  )
  return res.data
}

// 8. 급여 지급 내역 요약 (목록)
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

// 9. Payroll Run 상태 조회 (마감 여부)
export async function fetchPayrollRunStatus(params: {
  storeId: number
  yearMonth: string
}): Promise<PayrollRunStatusRes> {
  const { storeId, yearMonth } = params
  const res = await apiClient.get<PayrollRunStatusRes>(
    "/owner/payroll/history/run",
    {
      params: { storeId, yearMonth },
    },
  )
  return res.data
}

/* =========================================
   [직원] 급여 조회 API
   ========================================= */

// TODO: 실제 구현 시 Context 등에서 가져와야 함
const MOCK_STORE_ID = 1
const MOCK_EMPLOYEE_ID = 3

const formatCurrency = (value: number) => `₩${value.toLocaleString()}`

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

  const latest = items[0]
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