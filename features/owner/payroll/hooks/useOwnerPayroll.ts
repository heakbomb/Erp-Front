// features/owner/payroll/hooks/useOwnerPayroll.ts
"use client"

import { useMemo, useState, useEffect } from "react"
import { useStore } from "@/contexts/StoreContext"
import {
  fetchOwnerPayroll,
  type EmployeePayroll,
  type PayrollHistory,
} from "@/features/owner/payroll/services/ownerPayrollService"

export default function useOwnerPayroll(yearMonth: string) {
  const { currentStoreId } = useStore()

  const [employees, setEmployees] = useState<EmployeePayroll[]>([])
  const [history, setHistory] = useState<PayrollHistory[]>([])

  const [searchQuery, setSearchQuery] = useState("")
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    if (!currentStoreId || !yearMonth) return

    const run = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await fetchOwnerPayroll({
          storeId: currentStoreId,
          month: yearMonth, // "yyyy-MM"
        })

        if (!mounted) return
        setEmployees(data.employees)
        setHistory(data.history)
      } catch (e: any) {
        if (!mounted) return
        console.error("급여 데이터 불러오기 실패:", e)
        setError(e?.friendlyMessage ?? e?.message ?? "급여 데이터를 불러오지 못했습니다.")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    run()

    return () => {
      mounted = false
    }
  }, [currentStoreId, yearMonth])

  const totalPayroll = useMemo(
    () => employees.reduce((sum, emp) => sum + emp.netPay, 0),
    [employees],
  )

  const totalWorkHours = useMemo(
    () => employees.reduce((sum, emp) => sum + emp.workHours, 0),
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
    totalWorkHours,
    filteredEmployees,
    searchQuery,
    setSearchQuery,
    isSettingsDialogOpen,
    setIsSettingsDialogOpen,
    loading,
    error,
  }
}