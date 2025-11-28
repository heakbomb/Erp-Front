// features/owner/employees/hooks/useEmployeesAll.ts
"use client"

import { useEffect, useMemo, useState } from "react"

// ✅ Employee 타입은 공용 타입 정의에서 가져오기
import type { Employee } from "@/lib/types/database"

import {
  fetchEmployees,
  updateEmployee as svcUpdateEmployee,
  deleteEmployee as svcDeleteEmployee,
  extractErrorMessage,
} from "@/features/owner/employees/services/employeesService"

export type Banner = { type: "success" | "error"; message: string } | null

export default function useEmployeesAll() {
  const [searchQuery, setSearchQuery] = useState("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)

  const [banner, setBanner] = useState<Banner>(null)

  const [openEdit, setOpenEdit] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", provider: "" })
  const [saving, setSaving] = useState(false)

  const [openDelete, setOpenDelete] = useState(false)
  const [targetToDelete, setTargetToDelete] = useState<Employee | null>(null)

  const bannerShow = (b: Banner) => {
    setBanner(b)
    setTimeout(() => setBanner(null), 2400)
  }

  const loadEmployees = async () => {
    try {
      setLoading(true)
      const data = await fetchEmployees()
      setEmployees(data)
    } catch (e) {
      console.error("직원 목록 불러오기 실패:", e)
      alert("직원 목록을 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return employees
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.phone.toLowerCase().includes(q) ||
        (e.provider || "").toLowerCase().includes(q),
    )
  }, [employees, searchQuery])

  const openEditDialog = (emp: Employee) => {
    setEditingId(emp.employeeId)
    setEditForm({
      name: emp.name ?? "",
      email: emp.email ?? "",
      phone: emp.phone ?? "",
      provider: emp.provider ?? "",
    })
    setOpenEdit(true)
  }

  const handleUpdate = async () => {
    if (!editingId) return
    if (
      !editForm.name.trim() ||
      !editForm.email.trim() ||
      !editForm.phone.trim() ||
      !editForm.provider.trim()
    ) {
      alert("이름/이메일/전화/Provider는 필수입니다.")
      return
    }
    try {
      setSaving(true)
      await svcUpdateEmployee({
        employeeId: editingId,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        provider: editForm.provider,
      })
      setOpenEdit(false)
      setEditingId(null)
      await loadEmployees()
      bannerShow({ type: "success", message: "직원 정보가 수정되었습니다." })
    } catch (e: any) {
      console.error("직원 수정 실패:", e)
      const msg = extractErrorMessage(e)
      bannerShow({ type: "error", message: String(msg) })
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!targetToDelete) return
    try {
      await svcDeleteEmployee(targetToDelete.employeeId)
      setOpenDelete(false)
      await loadEmployees()
      bannerShow({ type: "success", message: "직원이 삭제되었습니다." })
    } catch (e) {
      console.error("직원 삭제 실패:", e)
      bannerShow({ type: "error", message: "삭제 중 오류가 발생했습니다." })
    }
  }

  const formatDate = (iso?: string) => (iso ? iso.slice(0, 10) : "-")

  return {
    // state
    searchQuery,
    employees,
    loading,
    banner,
    openEdit,
    editingId,
    editForm,
    saving,
    openDelete,
    targetToDelete,
    // setters
    setSearchQuery,
    setOpenEdit,
    setEditForm,
    setOpenDelete,
    setTargetToDelete,
    // derived
    filtered,
    formatDate,
    // actions
    openEditDialog,
    handleUpdate,
    confirmDelete,
  }
}