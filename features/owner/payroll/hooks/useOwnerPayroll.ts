"use client"

import { useMemo, useState, useEffect } from "react"
import {
  fetchOwnerPayroll,
  MOCK_EMPLOYEE_PAYROLL,
  MOCK_PAYROLL_HISTORY,
  type EmployeePayroll,
  type PayrollHistory,
} from "@/features/owner/payroll/services/ownerPayrollService"

export default function useOwnerPayroll() {
  const [employees, setEmployees] = useState<EmployeePayroll[]>(MOCK_EMPLOYEE_PAYROLL)
  const [history, setHistory] = useState<PayrollHistory[]>(MOCK_PAYROLL_HISTORY)

  const [searchQuery, setSearchQuery] = useState("")
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 나중에 진짜 API 붙일 때 사용
  useEffect(() => {
    let mounted = true

    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchOwnerPayroll()
        if (!mounted) return
        setEmployees(data.employees)
        setHistory(data.history)
      } catch (e: any) {
        if (mounted) {
          setError(e?.message ?? "급여 데이터를 불러오지 못했습니다.")
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // 지금은 목데이터만 쓰니까 호출 안 함
    // run()

    return () => {
      mounted = false
    }
  }, [])

  const totalPayroll = useMemo(
    () => employees.reduce((sum, emp) => sum + emp.netPay, 0),
    [employees],
  )

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees
    const q = searchQuery.trim().toLowerCase()
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q),
    )
  }, [employees, searchQuery])

  return {
    employees,
    history,
    totalPayroll,
    filteredEmployees,
    searchQuery,
    setSearchQuery,
    isSettingsDialogOpen,
    setIsSettingsDialogOpen,
    loading,
    error,
  }
}