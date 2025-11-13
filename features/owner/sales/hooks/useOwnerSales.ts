"use client"

import { useEffect, useState } from "react"
import {
  fetchOwnerSales,
  MOCK_DAILY_SALES_DATA,
  MOCK_TOP_MENUS,
  MOCK_RECENT_TRANSACTIONS,
  type DailySalesDatum,
  type TopMenu,
  type RecentTransaction,
} from "@/features/owner/sales/services/ownerSalesService"

export default function useOwnerSales() {
  const [dailySalesData, setDailySalesData] = useState<DailySalesDatum[]>(MOCK_DAILY_SALES_DATA)
  const [topMenus, setTopMenus] = useState<TopMenu[]>(MOCK_TOP_MENUS)
  const [recentTransactions, setRecentTransactions] =
    useState<RecentTransaction[]>(MOCK_RECENT_TRANSACTIONS)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 나중에 실제 API 쓰고 싶으면 이 주석만 풀면 됨
  useEffect(() => {
    let mounted = true

    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchOwnerSales()
        if (!mounted) return
        setDailySalesData(data.dailySalesData)
        setTopMenus(data.topMenus)
        setRecentTransactions(data.recentTransactions)
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "매출 데이터를 불러오지 못했습니다.")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // run()

    return () => {
      mounted = false
    }
  }, [])

  return {
    dailySalesData,
    topMenus,
    recentTransactions,
    loading,
    error,
  }
}