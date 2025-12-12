// features/owner/employees/hooks/useEmployeesAll.ts
"use client"

import { useEffect, useMemo, useState } from "react"
import { useStore } from "@/contexts/StoreContext"

import type { Employee } from "@/lib/types/database"

import {
  fetchEmployees,
  updateEmployee as svcUpdateEmployee,
  deleteEmployee as svcDeleteEmployee,
  extractErrorMessage,
} from "@/features/owner/employees/services/employeesService"

export type Banner = { type: "success" | "error"; message: string } | null

// 🔹 이 화면에서만 쓰는 확장 타입: assignmentId 포함
type StoreEmployee = Employee & { assignmentId?: number | null }

export default function useEmployeesAll() {
  const { currentStoreId } = useStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [employees, setEmployees] = useState<StoreEmployee[]>([])
  const [loading, setLoading] = useState(false)

  const [banner, setBanner] = useState<Banner>(null)

  const [openEdit, setOpenEdit] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", provider: "" })
  const [saving, setSaving] = useState(false)

  const [openDelete, setOpenDelete] = useState(false)
  const [targetToDelete, setTargetToDelete] = useState<StoreEmployee | null>(null)

  const bannerShow = (b: Banner) => {
    setBanner(b)
    setTimeout(() => setBanner(null), 2400)
  }

  const loadEmployees = async (storeId: number) => {
    try {
      setLoading(true)
      // ✅ 여기서만 storeId 사용
      const data = await fetchEmployees(storeId)
      setEmployees(data)
    } catch (e) {
      console.error("직원 목록 불러오기 실패:", e)
      bannerShow({ type: "error", message: "직원 목록을 불러오지 못했습니다." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!currentStoreId) {
      // 매장 선택 안 된 경우 목록 비우기
      setEmployees([])
      return
    }
    loadEmployees(currentStoreId)
  }, [currentStoreId])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return employees
    return employees.filter(
      (e) =>
        (e.name ?? "").toLowerCase().includes(q) ||
        (e.email ?? "").toLowerCase().includes(q) ||
        (e.phone ?? "").toLowerCase().includes(q) ||
        (e.provider ?? "").toLowerCase().includes(q),
    )
  }, [employees, searchQuery])

  const openEditDialog = (emp: StoreEmployee) => {
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
      if (currentStoreId) await loadEmployees(currentStoreId)
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

    // ✅ 이제 employee가 아니라 assignment를 끊는다
    if (!targetToDelete.assignmentId) {
      console.error("assignmentId가 없어 직원 배정을 해제할 수 없습니다.", targetToDelete)
      bannerShow({
        type: "error",
        message: "이 직원의 배정 정보를 찾을 수 없습니다. 새로고침 후 다시 시도해 주세요.",
      })
      return
    }

    try {
      await svcDeleteEmployee(targetToDelete.assignmentId)
      setOpenDelete(false)
      if (currentStoreId) await loadEmployees(currentStoreId)
      bannerShow({ type: "success", message: "직원이 이 사업장에서 제거되었습니다." })
    } catch (e) {
      console.error("직원 삭제(배정 해제) 실패:", e)
      bannerShow({ type: "error", message: "삭제 중 오류가 발생했습니다." })
    }
  }

  const formatDate = (iso?: string | null) => (iso ? iso.slice(0, 10) : "-")

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