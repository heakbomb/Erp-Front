// src/features/owner/sales/hooks/useOwnerSales.ts
"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api/client"
import { useStore } from "@/contexts/StoreContext"

export type DailySales = {
  date: string
  sales: number
}

export type TopMenu = {
  menuId: number
  name: string
  quantity: number
  revenue: number
  growth: number
}

export type TransactionSummary = {
  transactionId: number
  transactionTime: string
  paymentMethod: string
  status: string
  totalAmount: number
  totalDiscount: number
  itemsSummary: string
}

export type SalesSummary = {
  todaySales: number
  todaySalesChangeRate: number
  weekSales: number
  weekSalesChangeRate: number
  monthSales: number
  monthSalesChangeRate: number
  avgTicket: number
  avgTicketChangeRate: number
}

type Period = "DAY" | "WEEK" | "MONTH" | "YEAR"

type UseOwnerSalesResult = {
  // 상단 요약 카드
  summary: SalesSummary | null

  // 매출 그래프
  salesPeriod: Period
  setSalesPeriod: (p: Period) => void
  dailySalesData: DailySales[]

  // 메뉴별 분석
  menuPeriod: Period
  setMenuPeriod: (p: Period) => void
  topMenus: TopMenu[]

  // 거래 내역
  txFrom: string
  txTo: string
  setTxFrom: (v: string) => void
  setTxTo: (v: string) => void
  recentTransactions: TransactionSummary[]
}

export default function useOwnerSales(): UseOwnerSalesResult {
  const { currentStoreId } = useStore()

  const [salesPeriod, setSalesPeriod] = useState<Period>("DAY")
  const [menuPeriod, setMenuPeriod] = useState<Period>("DAY")

  const [summary, setSummary] = useState<SalesSummary | null>(null)
  const [dailySalesData, setDailySalesData] = useState<DailySales[]>([])
  const [topMenus, setTopMenus] = useState<TopMenu[]>([])
  const [recentTransactions, setRecentTransactions] = useState<TransactionSummary[]>([])

  // 거래 내역용 날짜 범위 (기본: 오늘 ~ 오늘)
  const todayStr = new Date().toISOString().slice(0, 10)
  const [txFrom, setTxFrom] = useState<string>(todayStr)
  const [txTo, setTxTo] = useState<string>(todayStr)

  // ✅ 매출 요약 + 매출 그래프 + 메뉴 TOP5
  useEffect(() => {
    if (!currentStoreId) return

    const fetchSalesAndMenu = async () => {
      try {
        const [summaryRes, dailyRes, menuRes] = await Promise.all([
          apiClient.get<SalesSummary>("/owner/sales/summary", {
            params: { storeId: currentStoreId },
          }),
          apiClient.get<DailySales[]>("/owner/sales/daily", {
            params: {
              storeId: currentStoreId,
              period: salesPeriod,
            },
          }),
          apiClient.get<TopMenu[]>("/owner/sales/top-menus", {
            params: {
              storeId: currentStoreId,
              period: menuPeriod,
            },
          }),
        ])

        setSummary(summaryRes.data)
        setDailySalesData(dailyRes.data)
        setTopMenus(menuRes.data)
      } catch (e) {
        console.error(e)
      }
    }

    fetchSalesAndMenu()
  }, [currentStoreId, salesPeriod, menuPeriod])

  // 거래 내역 (기간 변경 시마다 재조회)
  useEffect(() => {
    if (!currentStoreId) return
    if (!txFrom || !txTo) return

    const fetchTransactions = async () => {
      try {
        const res = await apiClient.get<TransactionSummary[]>(
          "/owner/sales/transactions",
          {
            params: {
              storeId: currentStoreId,
              from: txFrom,
              to: txTo,
            },
          },
        )
        setRecentTransactions(res.data)
      } catch (e) {
        console.error(e)
      }
    }

    fetchTransactions()
  }, [currentStoreId, txFrom, txTo])

  return {
    summary,
    salesPeriod,
    setSalesPeriod,
    dailySalesData,
    menuPeriod,
    setMenuPeriod,
    topMenus,
    txFrom,
    txTo,
    setTxFrom,
    setTxTo,
    recentTransactions,
  }
}
