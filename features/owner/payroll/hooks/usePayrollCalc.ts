// features/owner/payroll/hooks/usePayrollCalc.ts
"use client"

import { useState } from "react"
import { useStore } from "@/contexts/StoreContext"
import {
  calculatePayroll,
  type PayrollCalcResult,
  extractErrorMessage,
} from "@/features/owner/payroll/services/payrollCalcService"

export default function usePayrollCalc() {
  const { currentStoreId } = useStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PayrollCalcResult | null>(null)

  const runCalc = async (yearMonth: string) => {
    if (!currentStoreId) {
      alert("현재 선택된 사업장이 없습니다.")
      return
    }

    // ✅ 중복 실행 방지
    if (loading) return

    try {
      setLoading(true)
      setError(null)

      const data = await calculatePayroll({
        storeId: currentStoreId,
        yearMonth,
      })

      setResult(data)
      return data
    } catch (e) {
      console.error("급여 자동 계산 실패:", e)

      const msg = extractErrorMessage(e)
      setError(msg)

      // ✅ 중요: 실패를 호출자(PayrollCalcDialog)도 알 수 있게 throw
      throw e
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    result,
    runCalc,
  }
}