// modules/payrollC/useEmployeePayroll.ts
"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/contexts/StoreContext"
import { useAuth } from "@/contexts/AuthContext"
import { fetchEmployeePayrollData } from "./payrollApi"
import type { EmployeePayrollData } from "./payrollTypes"

const INITIAL_DATA: EmployeePayrollData = {
  currentWorkplace: "현재 사업장",
  currentSummary: {
    titleMonth: "불러오는 중...",
    basePay: "₩0",
    bonus: "₩0",
    deductions: "₩0",
    netPay: "₩0",
  },
  history: [],
}

export function useEmployeePayroll(): EmployeePayrollData {
  const [data, setData] = useState<EmployeePayrollData>(INITIAL_DATA)

  const { currentStoreId } = useStore()
  const { employeeId, isLoggedIn, isLoading } = useAuth()

  useEffect(() => {
    let mounted = true

    // ✅ 인증 로딩 중이면 대기 (UI 변경 없이 데이터만 대기)
    if (isLoading) return

    // ✅ 로그인/필수값 없으면 호출하지 않음
    if (!isLoggedIn || !employeeId || !currentStoreId) return

    ;(async () => {
      try {
        const fetched = await fetchEmployeePayrollData({
          storeId: currentStoreId,
          employeeId,
        })
        if (mounted) setData(fetched)
      } catch (e) {
        console.error("직원 급여 이력 조회 실패:", e)
      }
    })()

    return () => {
      mounted = false
    }
  }, [isLoading, isLoggedIn, employeeId, currentStoreId])

  return data
}