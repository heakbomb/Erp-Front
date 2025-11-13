"use client"

import { useEmployeeDashboard } from "@/features/employee/dashboard/hooks/useEmployeeDashboard"
import { EmployeeDashboardView } from "@/features/employee/dashboard/components/EmployeeDashboardView"

export default function EmployeeDashboardPage() {
  const dashboard = useEmployeeDashboard()
  return <EmployeeDashboardView {...dashboard} />
}