// features/owner/dashboard/hooks/useOwnerDashboard.ts
"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/contexts/StoreContext"
import {
  fetchOwnerDashboard,
  MOCK_OWNER_DASHBOARD,
  type OwnerDashboardData,
} from "@/features/owner/dashboard/services/ownerDashboardService"

type UseOwnerDashboardResult = OwnerDashboardData & {
  loading: boolean
  error: string | null
}

export default function useOwnerDashboard(): UseOwnerDashboardResult {
  const { currentStoreId } = useStore()
  const [data, setData] = useState<OwnerDashboardData>(MOCK_OWNER_DASHBOARD)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentStoreId) return

    let mounted = true

    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetchOwnerDashboard(currentStoreId)
        if (mounted) {
          setData(res)
        }
      } catch (e: any) {
        console.error(e)
        if (mounted) {
          setError(e?.message ?? "대시보드 데이터를 불러오지 못했습니다.")
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    run()

    return () => {
      mounted = false
    }
  }, [currentStoreId])

  return {
    ...data,
    loading,
    error,
  }
}
