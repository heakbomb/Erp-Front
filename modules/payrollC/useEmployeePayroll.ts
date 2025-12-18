"use client"

import { useEffect, useState } from "react"
import {
  fetchEmployeePayrollData,
} from "./payrollApi"
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
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  return data
}