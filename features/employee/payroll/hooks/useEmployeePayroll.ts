"use client"

import { useMemo } from "react"
import {
  getMockEmployeePayrollData,
  type EmployeePayrollData,
} from "../services/payrollService"

export function useEmployeePayroll(): EmployeePayrollData {
  // 나중에 API 붙일 때 여기만 고치면 됨
  const data = useMemo(() => getMockEmployeePayrollData(), [])
  return data
}