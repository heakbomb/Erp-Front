"use client"

import { useEffect, useState } from "react"
import {
  PendingRequest,
  fetchPendingAssignments,
  approveAssignment,
  rejectAssignment,
} from "@/features/owner/employees/services/employeesService"

export type Banner = { type: "success" | "error"; message: string } | null

// 🔹 로컬스토리지 키
const HISTORY_STORAGE_KEY = "erp_employee_assignment_history"

// 🔹 로컬스토리지에서 최근 승인/거절 내역 불러오기
function loadHistoryFromStorage(): {
  recentApproved: PendingRequest[]
  recentRejected: PendingRequest[]
} {
  if (typeof window === "undefined") {
    return { recentApproved: [], recentRejected: [] }
  }
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!raw) return { recentApproved: [], recentRejected: [] }
    const parsed = JSON.parse(raw)
    return {
      recentApproved: parsed.recentApproved ?? [],
      recentRejected: parsed.recentRejected ?? [],
    }
  } catch {
    return { recentApproved: [], recentRejected: [] }
  }
}

// 🔹 로컬스토리지에 최근 승인/거절 내역 저장
function saveHistoryToStorage(approved: PendingRequest[], rejected: PendingRequest[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify({ recentApproved: approved, recentRejected: rejected }),
    )
  } catch {
    // 실패해도 앱 동작에는 영향 없음
  }
}

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
    // 1) 대기 목록 조회
    fetchPending()
    // 2) 최근 승인/거절 내역 복원
    const saved = loadHistoryFromStorage()
    setRecentApproved(saved.recentApproved)
    setRecentRejected(saved.recentRejected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const approve = async (assignmentId: number) => {
    const target = pending.find((p) => p.assignmentId === assignmentId)
    if (!target) return

    setPending((prev) => prev.filter((p) => p.assignmentId !== assignmentId))
    try {
      await approveAssignment(assignmentId)
      setRecentApproved((prev) => {
        const updated = [{ ...target, status: "APPROVED" }, ...prev].slice(0, 8)
        // 로컬스토리지에 저장
        saveHistoryToStorage(updated, recentRejected)
        return updated
      })
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
      setRecentRejected((prev) => {
        const updated = [{ ...target, status: "REJECTED" }, ...prev].slice(0, 8)
        // 로컬스토리지에 저장
        saveHistoryToStorage(recentApproved, updated)
        return updated
      })
      bannerShow({ type: "success", message: `${target.name ?? "직원"} 거절 처리` })
    } catch (e) {
      setPending((prev) => [target, ...prev])
      console.error("거절 실패:", e)
      bannerShow({ type: "error", message: "거절 중 오류가 발생했습니다." })
    }
  }

  return {
    pending,
    loadingPending,
    storeIdForPending,
    recentApproved,
    recentRejected,
    banner,
    setStoreIdForPending,
    fetchPending,
    approve,
    reject,
  }
}