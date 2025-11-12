// features/owner/employees/hooks/useEmployeesPending.ts
"use client"

import { useEffect, useState } from "react"
import {
  PendingRequest,
  fetchPendingAssignments,
  approveAssignment,
  rejectAssignment,
} from "@/features/owner/employees/services/employeesService"

export type Banner = { type: "success" | "error"; message: string } | null

export default function useEmployeesPending() {
  const [pending, setPending] = useState<PendingRequest[]>([])
  const [loadingPending, setLoadingPending] = useState(false)
  const [storeIdForPending, setStoreIdForPending] = useState<string>("1")

  const [recentApproved, setRecentApproved] = useState<PendingRequest[]>([])
  const [recentRejected, setRecentRejected] = useState<PendingRequest[]>([])
  const [banner, setBanner] = useState<Banner>(null)

  const bannerShow = (b: Banner) => {
    setBanner(b)
    setTimeout(() => setBanner(null), 2400)
  }

  const fetchPending = async (storeId?: number) => {
    const target = typeof storeId === "number" ? storeId : Number(storeIdForPending)
    if (Number.isNaN(target)) {
      setPending([])
      return
    }
    try {
      setLoadingPending(true)
      const data = await fetchPendingAssignments(target)
      setPending(data || [])
    } catch (e: any) {
      console.warn("신청 대기 목록 불러오기 실패, 무시:", e?.response?.data || e?.message)
      setPending([])
    } finally {
      setLoadingPending(false)
    }
  }

  useEffect(() => {
    fetchPending()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const approve = async (assignmentId: number) => {
    const target = pending.find((p) => p.assignmentId === assignmentId)
    if (!target) return
    setPending((prev) => prev.filter((p) => p.assignmentId !== assignmentId))
    try {
      await approveAssignment(assignmentId)
      setRecentApproved((prev) => [{ ...target, status: "APPROVED" }, ...prev].slice(0, 8))
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
      await rejectAssignment(assignmentId)
      setRecentRejected((prev) => [{ ...target, status: "REJECTED" }, ...prev].slice(0, 8))
      bannerShow({ type: "success", message: `${target.name ?? "직원"} 거절 처리` })
    } catch (e) {
      setPending((prev) => [target, ...prev])
      console.error("거절 실패:", e)
      bannerShow({ type: "error", message: "거절 중 오류가 발생했습니다." })
    }
  }

  return {
    pending, loadingPending, storeIdForPending,
    recentApproved, recentRejected, banner,
    setStoreIdForPending,
    fetchPending, approve, reject,
  }
}