"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/contexts/StoreContext"
import { apiClient } from "@/shared/api/apiClient"

export type MonthlySummary = {
    lastMonthTotal: number
    thisMonthTotal: number
    diff: number
}

export type MonthlyTopMenu = {
    menuName: string
    sales: number
    rate: number
}

export type WeeklyPoint = {
    weekIndex: number
    mySales: number
    areaAvgSales: number
}

export type MonthlyReport = {
    summary: MonthlySummary
    topMenus: MonthlyTopMenu[]
    weeklySales: WeeklyPoint[]
}

interface UseOwnerSalesReportParams {
    year: number
    month: number
}

export default function useOwnerSalesReport({ year, month }: UseOwnerSalesReportParams) {
    const { currentStoreId } = useStore()

    const [data, setData] = useState<MonthlyReport | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    useEffect(() => {
        if (!currentStoreId) return
        if (!year || !month) return

        const fetchReport = async () => {
            try {
                setLoading(true)
                setError(null)

                const res = await apiClient.get<MonthlyReport>(
                    `/owner/sales/stores/${currentStoreId}/reports/monthly`,
                    {
                        params: {
                            year,
                            month,
                        },
                    }
                )

                setData(res.data)
            } catch (e) {
                console.error("월간 리포트 조회 실패:", e)
                setError(e)
            } finally {
                setLoading(false)
            }
        }

        fetchReport()
    }, [currentStoreId, year, month])

    return { data, loading, error, currentStoreId }
}
