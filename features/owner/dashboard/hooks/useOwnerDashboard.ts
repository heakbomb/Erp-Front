"use client"

import { useEffect, useState } from "react"
import {
  fetchOwnerDashboard,
  MOCK_OWNER_DASHBOARD,
  type OwnerDashboardData,
} from "@/features/owner/dashboard/services/ownerDashboardService"

export default function useOwnerDashboard() {
  const [data, setData] = useState<OwnerDashboardData>(MOCK_OWNER_DASHBOARD)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetchOwnerDashboard()
        if (mounted) {
          setData(res)
        }
      } catch (e: any) {
        if (mounted) {
          setError(e?.message ?? "대시보드 데이터를 불러오지 못했습니다.")
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // 나중에 진짜 API 붙일 때 활성화
    // run()

    return () => {
      mounted = false
    }
  }, [])

  return {
    ...data,
    loading,
    error,
  }
}