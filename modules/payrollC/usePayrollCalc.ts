"use client"

import { useState } from "react"
import { useStore } from "@/contexts/StoreContext"
import {
  calculatePayroll,
  type PayrollCalcResult,
} from "./payrollApi" // 로컬 API 참조
import { extractErrorMessage } from "@/shared/utils/commonUtils"

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