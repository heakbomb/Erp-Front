// features/employee/payroll/hooks/useEmployeePayroll.ts
"use client"

import { useEffect, useState } from "react"
import {
  fetchEmployeePayrollData,
  type EmployeePayrollData,
} from "../services/payrollService"

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

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const fetched = await fetchEmployeePayrollData()
        if (mounted) {
          setData(fetched)
        }
      } catch (e) {
        console.error("직원 급여 이력 조회 실패:", e)
        // 에러 나면 기본값 그대로 둠
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  return data
}