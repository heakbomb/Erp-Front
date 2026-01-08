// modules/salesC/useSalesReport.ts
"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/contexts/StoreContext"
import { salesApi } from "./salesApi"
import type { MonthlyReport } from "./salesTypes"

export default function useSalesReport({ year, month }: { year: number; month: number }) {
  const { currentStoreId } = useStore()
  const [data, setData] = useState<MonthlyReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    if (!currentStoreId || !year || !month) return

    const fetchAll = async () => {
      try {
        setLoading(true)
        setError(null)

        // 1) 내 월간 리포트
        const report = await salesApi.getMonthlyReport(currentStoreId, year, month)

        // 2) 주간 지역평균
        const area = await salesApi.getWeeklyAreaAvg(currentStoreId, year, month, 2000)

        // 3) 주간 데이터에 areaAvgSales 합치기
        const weeklySales = (report.weeklySales || []).map((w) => {
          const match = area.data.find((a) => a.weekIndex === w.weekIndex)
          const raw = match?.areaAvgSales ?? 0
          return {
            ...w,
          areaAvgSales: Math.floor(Number(raw)),
          }
        })

        setData({ ...report, weeklySales })
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [currentStoreId, year, month])

  return { data, loading, error, currentStoreId }
}
