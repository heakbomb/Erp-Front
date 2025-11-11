"use client"

import React, { useState, useEffect, useMemo } from "react"
import axios from "axios"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EmployeesAll from "./EmployeesAll"
import EmployeesAttendance from "./EmployeesAttendance"
import EmployeesPending from "./EmployeesPending"
import EmployeesQr from "./EmployeesQr"

// 이 프로젝트에서 쓰는 기본 API 주소
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080"

// 필요한 최소 타입들만 이 파일 안에 선언
type Employee = {
  employeeId: number
  name: string
  email: string
  phone: string
  provider?: string
}

type PendingRequest = {
  assignmentId: number
  name?: string
  employeeId?: number
  storeId?: number
  status?: string
}

type Banner =
  | {
      type: "success" | "error"
      message: string
    }
  | null

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)

  // 신청 대기
  const [pending, setPending] = useState<PendingRequest[]>([])
  const [loadingPending, setLoadingPending] = useState(false)

  // 사업장별 조회 입력 (테스트용)
  const [storeIdForPending, setStoreIdForPending] = useState<string>("1")

  // 최근 처리 내역
  const [recentApproved, setRecentApproved] = useState<PendingRequest[]>([])
  const [recentRejected, setRecentRejected] = useState<PendingRequest[]>([])

  // 화면 상단 배너
  const [banner, setBanner] = useState<Banner>(null)

  // 수정/삭제 관련 상태
  const [openEdit, setOpenEdit] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", provider: "" })
  const [saving, setSaving] = useState(false)

  const [openDelete, setOpenDelete] = useState(false)
  const [targetToDelete, setTargetToDelete] = useState<Employee | null>(null)

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const res = await axios.get<Employee[]>(`${API_BASE}/api/employees`)
      setEmployees(res.data || [])
    } catch (e) {
      console.error("직원 목록 불러오기 실패:", e)
      alert("직원 목록을 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const fetchPending = async (storeId?: number) => {
    const target = typeof storeId === "number" ? storeId : Number(storeIdForPending)
    if (Number.isNaN(target)) {
      setPending([])
      return
    }
    try {
      setLoadingPending(true)
      const res = await axios.get<PendingRequest[]>(`${API_BASE}/api/assignments/pending`, {
        params: { storeId: target },
      })
      setPending(res.data || [])
    } catch (e) {
      console.error("신청 대기 목록 불러오기 실패:", e)
      setPending([])
    } finally {
      setLoadingPending(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
    fetchPending()
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

  // 이하 너가 올린 로직 그대로 ↓
  const bannerShow = (b: Banner) => {
    setBanner(b)
    setTimeout(() => setBanner(null), 2400)
  }

  const approve = async (assignmentId: number) => {
    const target = pending.find((p) => p.assignmentId === assignmentId)
    if (!target) return
    setPending((prev) => prev.filter((p) => p.assignmentId !== assignmentId))
    try {
      await axios.post(`${API_BASE}/api/assignments/${assignmentId}/approve`)
      setRecentApproved((prev) => [{ ...target, status: "APPROVED" }, ...prev].slice(0, 8))
      fetchEmployees()
      bannerShow({ type: "success", message: `${target.name ?? "직원"} 승인 완료` })
    } catch (e) {
      setPending((prev) => [target, ...prev])
      console.error("승인 실패:", e)
      bannerShow({ type: "error", message: "승인 중 오류가 발생했습니다." })
    }
  }

  const reject = async (assignmentId: number) => {
    const target = pending.find((p) => p.assignmentId === assignmentId)
    if (!target) return
    setPending((prev) => prev.filter((p) => p.assignmentId !== assignmentId))
    try {
      await axios.post(`${API_BASE}/api/assignments/${assignmentId}/reject`)
      setRecentRejected((prev) => [{ ...target, status: "REJECTED" }, ...prev].slice(0, 8))
      bannerShow({ type: "success", message: `${target.name ?? "직원"} 거절 처리` })
    } catch (e) {
      setPending((prev) => [target, ...prev])
      console.error("거절 실패:", e)
      bannerShow({ type: "error", message: "거절 중 오류가 발생했습니다." })
    }
  }

  // JSX는 원래 네가 올린 대로
  return (
    <div className="space-y-6">
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">전체 직원</TabsTrigger>
          <TabsTrigger value="pending">신청 대기</TabsTrigger>
          <TabsTrigger value="attendance">출결 현황</TabsTrigger>
          <TabsTrigger value="qr">QR 코드</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <EmployeesAll />
        </TabsContent>
        <TabsContent value="pending">
          <EmployeesPending />
        </TabsContent>
        <TabsContent value="attendance">
          <EmployeesAttendance />
        </TabsContent>
        <TabsContent value="qr">
          <EmployeesQr />
        </TabsContent>
      </Tabs>
    </div>
  )
}