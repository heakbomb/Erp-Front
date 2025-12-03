"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useStore } from "@/contexts/StoreContext"
import { toast } from "sonner"
import { format, startOfWeek, endOfWeek, startOfMonth, getWeek, parseISO, startOfYear } from "date-fns"
import { ko } from "date-fns/locale"
import {
  SalesSummaryResponse,
  DailySalesDatum,
  TransactionSummary,
  fetchSalesSummary,
  fetchDailySales,
  fetchTopMenus,
  fetchTransactions,
  refundTransaction
} from "../ownerSalesService"

export type SalesSummaryUI = {
  todaySales: number
  todayRate: number
  weekSales: number
  weekRate: number
  monthSales: number
  monthRate: number
  avgTicket: number
  avgTicketRate: number
}

// ✅ UI에서 사용할 최종 메뉴 타입
export type TopMenuUI = {
  menuId: number
  name: string
  quantity: number
  revenue: number
  share: number // 매출 비중 (%)
}

export type ChartData = {
  date: string
  sales: number
  originalDate?: string 
}

type Period = "DAY" | "WEEK" | "MONTH" | "YEAR"

const getRange = (period: Period) => {
  const today = new Date()
  const end = new Date(today)
  const start = new Date(today)

  const toDateString = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000
    return new Date(date.getTime() - offset).toISOString().slice(0, 10)
  }

  if (period === "DAY") {
    start.setDate(today.getDate() - 13) 
  } else if (period === "WEEK") {
    start.setDate(today.getDate() - 7 * 11) 
  } else if (period === "MONTH") {
    start.setMonth(today.getMonth() - 11) 
  } else if (period === "YEAR") {
    start.setFullYear(today.getFullYear() - 4) 
  }

  return {
    from: toDateString(start),
    to: toDateString(end),
  }
}

const getMenuRange = (period: Period) => {
  const today = new Date()
  let start = new Date(today)
  const end = new Date(today)

  const toDateString = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000
    return new Date(date.getTime() - offset).toISOString().slice(0, 10)
  }

  if (period === "DAY") {
    // 👉 오늘 하루만
    // start = today 그대로, end = today
  } else if (period === "WEEK") {
    // 👉 이번 주 (월~오늘)
    start = startOfWeek(today, { weekStartsOn: 1 })
  } else if (period === "MONTH") {
    // 👉 이번 달 1일 ~ 오늘
    start = startOfMonth(today)
  } else if (period === "YEAR") {
    // 👉 올해 1월 1일 ~ 오늘
    start = startOfYear(today)
  }

  return {
    from: toDateString(start),
    to: toDateString(end),
  }
}

const aggregateData = (dailyData: DailySalesDatum[], period: Period): ChartData[] => {
  if (period === "DAY") return dailyData;

  const map = new Map<string, number>();

  dailyData.forEach((item) => {
    const date = parseISO(item.date);
    let key = "";

    if (period === "WEEK") {
      const s = format(startOfWeek(date, { weekStartsOn: 1 }), "MM.dd");
      const e = format(endOfWeek(date, { weekStartsOn: 1 }), "MM.dd");
      key = `${s}~${e}`;
    } else if (period === "MONTH") {
      key = format(date, "yyyy-MM");
    } else if (period === "YEAR") {
      key = format(date, "yyyy");
    }

    const current = map.get(key) || 0;
    map.set(key, current + item.sales);
  });

  return Array.from(map.entries()).map(([date, sales]) => ({
    date,
    sales,
  }));
};

export default function useOwnerSales() {
  const { currentStoreId } = useStore()

  const [summary, setSummary] = useState<SalesSummaryUI | null>(null)
  const [salesPeriod, setSalesPeriod] = useState<Period>("DAY")
  const [menuPeriod, setMenuPeriod] = useState<Period>("MONTH")

  const [rawDailySales, setRawDailySales] = useState<DailySalesDatum[]>([])
  const [topMenus, setTopMenus] = useState<TopMenuUI[]>([])

  const todayStr = new Date().toISOString().slice(0, 10)
  const [txFrom, setTxFrom] = useState<string>(todayStr)
  const [txTo, setTxTo] = useState<string>(todayStr)
  const [transactions, setTransactions] = useState<TransactionSummary[]>([])
  const [txPage, setTxPage] = useState(0)
  const [txSize] = useState(10)
  const [txTotalPages, setTxTotalPages] = useState(0)
  const [txLoading, setTxLoading] = useState(false)

  const calcRate = (curr: number, prev: number) => {
    if (!prev || prev === 0) return 0
    return ((curr - prev) / prev) * 100
  }

  useEffect(() => {
    if (!currentStoreId) return

    const fetchData = async () => {
      try {
        const salesRange = getRange(salesPeriod)
        const menuRange = getMenuRange(menuPeriod)  

        // TopMenu는 any[]로 받아서 직접 매핑합니다.
        const [sumRes, dailyRes, menuRes] = await Promise.all([
          fetchSalesSummary(currentStoreId),
          fetchDailySales(currentStoreId, salesRange.from, salesRange.to),
          // fetchTopMenus가 any[]를 반환한다고 가정하거나 as any[]로 단언
          (fetchTopMenus(currentStoreId, menuRange.from, menuRange.to) as Promise<any[]>),
        ])

        const s = sumRes
        setSummary({
          todaySales: s.todaySales,
          todayRate: calcRate(s.todaySales, s.yesterdaySales),
          weekSales: s.thisWeekSales,
          weekRate: calcRate(s.thisWeekSales, s.lastWeekSales),
          monthSales: s.thisMonthSales,
          monthRate: calcRate(s.thisMonthSales, s.lastMonthSales),
          avgTicket: s.avgTicket,
          avgTicketRate: calcRate(s.avgTicket, s.prevAvgTicket),
        })

        setRawDailySales(dailyRes)

        // ✅ [수정됨] 메뉴 데이터 가공 (이름 매핑 & 비중 계산)
        const rawMenus = menuRes // 이미 any[]로 단언됨
        const totalRevenue = rawMenus.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0)
        
        setTopMenus(rawMenus.map((item: any) => ({
          menuId: item.menuId,
          // ⭐️ 백엔드가 'menuName'으로 보내면 그걸 쓰고, 없으면 'name'을 씁니다.
          name: item.menuName || item.name || "이름 없음", 
          quantity: item.quantity,
          revenue: item.revenue,
          // ⭐️ 비중 계산: (내 매출 / 전체 매출) * 100
          share: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
        })))

      } catch (e) {
        console.error("데이터 로드 실패:", e)
      }
    }

    fetchData()
  }, [currentStoreId, salesPeriod, menuPeriod])

  const chartData = useMemo(() => {
    return aggregateData(rawDailySales, salesPeriod);
  }, [rawDailySales, salesPeriod]);

  const loadTransactions = useCallback(async () => {
    if (!currentStoreId) return
    if (!txFrom || !txTo) return

    setTxLoading(true)
    try {
      const res = await fetchTransactions(currentStoreId, txFrom, txTo, txPage, txSize)
      setTransactions(res.content)
      setTxTotalPages(res.totalPages)
    } catch (e) {
      console.error(e)
    } finally {
      setTxLoading(false)
    }
  }, [currentStoreId, txFrom, txTo, txPage, txSize])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  const handleRefund = async (txId: number, isWaste: boolean, reason: string) => {
    try {
      await refundTransaction({ transactionId: txId, isWaste, reason })
      toast.success("취소되었습니다.")
      loadTransactions()
    } catch (e: any) {
      toast.error(e.response?.data?.message || "실패")
    }
  }

  return {
    summary,
    salesPeriod, setSalesPeriod,
    chartData,
    menuPeriod, setMenuPeriod,
    topMenus,
    txFrom, setTxFrom,
    txTo, setTxTo,
    transactions,
    txPage, setTxPage,
    txTotalPages,
    txLoading,
    handleRefund
  }
}