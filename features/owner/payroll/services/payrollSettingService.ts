// features/owner/payroll/services/payrollSettingService.ts
import { apiClient } from "@/shared/api/apiClient"
import { extractErrorMessage as utilExtractErrorMessage } from "@/lib/utils"

/** 백엔드 PayrollSettingDto 와 맞추기 */
export type PayrollSetting = {
  settingId: number | null
  employeeId: number
  employeeName: string
  baseWage: number      // 시급 or 월급 (숫자)
  wageType: string      // "HOURLY" | "MONTHLY" 등

  // ✅ 공제 관련 필드
  deductionType?: "NONE" | "FOUR_INSURANCE" | "TAX_3_3"
  deductionRate?: number | null
}

/** 에러 메시지 공통 처리 */
export function extractErrorMessage(e: any): string {
  return utilExtractErrorMessage(e)
}

/**
 * ✅ 특정 매장(storeId)의 직원별 급여 설정 목록 조회
 * GET /owner/payroll/settings?storeId=11
 */
export async function fetchPayrollSettings(storeId: number): Promise<PayrollSetting[]> {
  const res = await apiClient.get<PayrollSetting[]>("/owner/payroll/settings", {
    params: { storeId },
  })
  return res.data || []
}

/**
 * ✅ 직원 1명의 급여 설정 저장/수정
 * PUT /owner/payroll/settings/{employeeId}?storeId=11
 */
export async function savePayrollSetting(params: {
  storeId: number
  employeeId: number
  baseWage: number
  wageType: string
  deductionType: "NONE" | "FOUR_INSURANCE" | "TAX_3_3"
  deductionRate: number | null
}): Promise<PayrollSetting> {
  const { storeId, employeeId, baseWage, wageType, deductionType, deductionRate } = params

  const res = await apiClient.put<PayrollSetting>(
    `/owner/payroll/settings/${employeeId}`,
    {
      baseWage,
      wageType,
      deductionType,
      deductionRate,
    },
    {
      params: { storeId },
    },
  )

  return res.data
}