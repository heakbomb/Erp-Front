"use client"

import { useMemo } from "react"
import { getMockEmployeeDashboardData, type EmployeeDashboardData } from "../services/dashboardService"

export function useEmployeeDashboard(): EmployeeDashboardData {
  // 아직은 API 연동이 아니라 하드코딩 데이터 사용
  const data = useMemo(() => getMockEmployeeDashboardData(), [])
  return data
}