// modules/salesC/useOwnerSales.ts
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useStore } from "@/contexts/StoreContext";
import { toast } from "sonner"; // 또는 사용중인 toast
import { format, startOfWeek, endOfWeek, startOfMonth, parseISO, startOfYear } from "date-fns";
import { salesApi } from "./salesApi";
import type {
  SalesSummaryUI,
  Period,
  DailySalesDatum,
  ChartData,
  TopMenu,
  TransactionSummary
} from "./salesTypes";

const getRange = (period: Period) => {
  const today = new Date();
  const end = new Date(today);
  const start = new Date(today);

  const toDateString = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  };

  if (period === "DAY") start.setDate(today.getDate() - 13);
  else if (period === "WEEK") start.setDate(today.getDate() - 7 * 11);
  else if (period === "MONTH") start.setMonth(today.getMonth() - 11);
  else if (period === "YEAR") start.setFullYear(today.getFullYear() - 4);

  return { from: toDateString(start), to: toDateString(end) };
};

const getMenuRange = (period: Period) => {
  const today = new Date();
  let start = new Date(today);
  const end = new Date(today);

  const toDateString = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  };

  if (period === "WEEK") start = startOfWeek(today, { weekStartsOn: 1 });
  else if (period === "MONTH") start = startOfMonth(today);
  else if (period === "YEAR") start = startOfYear(today);
  // DAY는 오늘 하루

  return { from: toDateString(start), to: toDateString(end) };
};

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
    } else if (period === "MONTH") key = format(date, "yyyy-MM");
    else if (period === "YEAR") key = format(date, "yyyy");

    map.set(key, (map.get(key) || 0) + item.sales);
  });

  return Array.from(map.entries()).map(([date, sales]) => ({ date, sales }));
};

export function useOwnerSales() {
  const { currentStoreId } = useStore();

  const [summary, setSummary] = useState<SalesSummaryUI | null>(null);
  const [salesPeriod, setSalesPeriod] = useState<Period>("DAY");
  const [menuPeriod, setMenuPeriod] = useState<Period>("MONTH");
  const [rawDailySales, setRawDailySales] = useState<DailySalesDatum[]>([]);
  const [topMenus, setTopMenus] = useState<TopMenu[]>([]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const [txFrom, setTxFrom] = useState<string>(todayStr);
  const [txTo, setTxTo] = useState<string>(todayStr);
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [txPage, setTxPage] = useState(0);
  const [txSize] = useState(10);
  const [txTotalPages, setTxTotalPages] = useState(0);
  const [txLoading, setTxLoading] = useState(false);

  const calcRate = (curr: number, prev: number) => (!prev ? 0 : ((curr - prev) / prev) * 100);

  useEffect(() => {
    if (!currentStoreId) return;

    const fetchData = async () => {
      try {
        const salesRange = getRange(salesPeriod);
        const menuRange = getMenuRange(menuPeriod);

        const [sumRes, dailyRes, menuRes] = await Promise.all([
          salesApi.fetchSalesSummary(currentStoreId),
          salesApi.fetchDailySales(currentStoreId, salesRange.from, salesRange.to),
          salesApi.fetchTopMenus(currentStoreId, menuRange.from, menuRange.to),
        ]);

        setSummary({
          todaySales: sumRes.todaySales,
          todayRate: calcRate(sumRes.todaySales, sumRes.yesterdaySales),
          weekSales: sumRes.thisWeekSales,
          weekRate: calcRate(sumRes.thisWeekSales, sumRes.lastWeekSales),
          monthSales: sumRes.thisMonthSales,
          monthRate: calcRate(sumRes.thisMonthSales, sumRes.lastMonthSales),
          avgTicket: sumRes.avgTicket,
          avgTicketRate: calcRate(sumRes.avgTicket, sumRes.prevAvgTicket),
        });

        setRawDailySales(dailyRes);

        const totalRevenue = menuRes.reduce((sum, item) => sum + (item.revenue || 0), 0);
        setTopMenus(menuRes.map((item: any) => ({
          menuId: item.menuId,
          name: item.menuName || item.name || "이름 없음",
          quantity: item.quantity,
          revenue: item.revenue,
          share: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
        })));
      } catch (e) {
        console.error("Dashboard Data Error", e);
      }
    };
    fetchData();
  }, [currentStoreId, salesPeriod, menuPeriod]);

  const chartData = useMemo(() => aggregateData(rawDailySales, salesPeriod), [rawDailySales, salesPeriod]);

  const loadTransactions = useCallback(async () => {
    if (!currentStoreId || !txFrom || !txTo) return;
    setTxLoading(true);
    try {
      const res = await salesApi.fetchTransactions(currentStoreId, txFrom, txTo, txPage, txSize);
      setTransactions(res.content);
      setTxTotalPages(res.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setTxLoading(false);
    }
  }, [currentStoreId, txFrom, txTo, txPage, txSize]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const handleRefund = async (txId: number, isWaste: boolean, reason: string) => {
    try {
      await salesApi.refundTransaction({ transactionId: txId, isWaste, reason });
      toast.success("취소되었습니다.");
      loadTransactions();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "취소 실패");
    }
  };

  return {
    summary,
    salesPeriod, setSalesPeriod, chartData,
    menuPeriod, setMenuPeriod, topMenus,
    txFrom, setTxFrom, txTo, setTxTo,
    transactions, txPage, setTxPage, txTotalPages, txLoading,
    handleRefund
  };
}