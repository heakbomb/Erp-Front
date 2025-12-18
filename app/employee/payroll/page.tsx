"use client"

import EmployeePayrollView from "@/modules/payrollC/EmployeePayrollView"
import { useEmployeePayroll } from "@/modules/payrollC/useEmployeePayroll"

export default function EmployeePayrollPage() {
  // 1. 커스텀 훅을 통해 급여 데이터 가져오기
  const payrollData = useEmployeePayroll()

  // 2. 뷰 컴포넌트에 데이터 전달 (Spread 문법 사용)
  return <EmployeePayrollView {...payrollData} />
}