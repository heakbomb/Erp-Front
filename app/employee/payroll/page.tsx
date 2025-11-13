"use client"

import { useEmployeePayroll } from "@/features/employee/payroll/hooks/useEmployeePayroll"
import { EmployeePayrollView } from "@/features/employee/payroll/components/EmployeePayrollView"

export default function PayrollPage() {
  const payroll = useEmployeePayroll()
  return <EmployeePayrollView {...payroll} />
}