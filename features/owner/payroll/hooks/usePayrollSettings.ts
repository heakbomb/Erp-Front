// features/owner/payroll/hooks/usePayrollSettings.ts
"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/contexts/StoreContext"
import {
  fetchPayrollSettings,
  savePayrollSetting,
  type PayrollSetting,
  extractErrorMessage,
} from "@/features/owner/payroll/services/payrollSettingService"

export default function usePayrollSettings() {
  const { currentStoreId } = useStore()

  const [settings, setSettings] = useState<PayrollSetting[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savingEmployeeId, setSavingEmployeeId] = useState<number | null>(null)

  const load = async (storeId: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchPayrollSettings(storeId)

      // ✅ 공제 기본값 보정
      const normalized = data.map((s) => ({
        ...s,
        deductionType: s.deductionType ?? "NONE",
        deductionRate: s.deductionRate ?? null,
      }))

      setSettings(normalized)
    } catch (e) {
      console.error("급여 설정 불러오기 실패:", e)
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!currentStoreId) return
    load(currentStoreId)
  }, [currentStoreId])

  /** 로컬 상태에서 특정 직원의 필드만 수정 */
  const updateSettingField = (employeeId: number, patch: Partial<PayrollSetting>) => {
    setSettings((prev) =>
      prev.map((s) => (s.employeeId === employeeId ? { ...s, ...patch } : s)),
    )
  }

  /** 실제 저장 호출 */
  const saveOne = async (employeeId: number): Promise<boolean> => {
    if (!currentStoreId) {
      alert("현재 선택된 사업장이 없습니다.")
      return false
    }
    const target = settings.find((s) => s.employeeId === employeeId)
    if (!target) return false

    try {
      setSavingEmployeeId(employeeId)
      setError(null)

      const saved = await savePayrollSetting({
        storeId: currentStoreId,
        employeeId,
        baseWage: Number(target.baseWage) || 0,
        wageType: target.wageType || "HOURLY",
        deductionType: target.deductionType || "NONE",
        deductionRate: target.deductionRate ?? null,
      })

      // 서버에서 리턴한 값으로 갱신
      setSettings((prev) =>
        prev.map((s) => (s.employeeId === employeeId ? { ...s, ...saved } : s)),
      )

      return true
    } catch (e) {
      console.error("급여 설정 저장 실패:", e)
      setError(extractErrorMessage(e))
      return false
    } finally {
      setSavingEmployeeId(null)
    }
  }

  return {
    settings,
    loading,
    error,
    savingEmployeeId,
    updateSettingField,
    saveOne,
    reload: () => {
      if (currentStoreId) load(currentStoreId)
    },
  }
}