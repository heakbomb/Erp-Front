"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/contexts/StoreContext";
import { dashboardApi } from "./dashboardApi";
import type { OwnerDashboardData, EmployeeDashboardData } from "./dashboardTypes";

// 1. 관리자 훅
export function useAdminDashboard() {
  const {
    data: statsData,
    isLoading: isStatsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: dashboardApi.getAdminDashboardStats,
  });

  return {
    statsData,
    isStatsLoading,
    statsError,
  };
}

// 2. 사장님 훅
const MOCK_OWNER_INITIAL: OwnerDashboardData = {
  stats: {
    todaySales: 0, todaySalesChange: 0, monthSales: 0, monthSalesChange: 0,
    lowStockCount: 0, workingEmployees: 0, totalEmployees: 0,
  },
  alerts: [], quickActions: [], aiInsights: [],
};

export function useOwnerDashboard() {
  const { currentStoreId } = useStore();
  const [data, setData] = useState<OwnerDashboardData>(MOCK_OWNER_INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentStoreId) return;
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await dashboardApi.getOwnerDashboard(currentStoreId);
        if (mounted) setData(res);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "데이터 로드 실패");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [currentStoreId]);

  return { ...data, stats: data.stats || MOCK_OWNER_INITIAL.stats, loading, error };
}

// 3. 직원 훅 (features의 Mock Data 로직 이식)
export function useEmployeeDashboard(): EmployeeDashboardData {
  const data = useMemo<EmployeeDashboardData>(() => ({
    currentWorkplace: "김사장님의 카페",
    quickStats: {
      todayWorkTime: "5시간 30분",
      todayStartTime: "09:00 출근",
      monthWorkDays: "18일",
      monthWorkHours: "총 144시간",
      expectedSalary: "₩1,440,000",
      hourlyWage: "시급 ₩10,000",
      workStatus: "근무중",
      expectedLeaveTime: "퇴근 예정 18:00",
    },
    recentRecords: [
      { date: "2024-04-19", start: "09:00", end: "18:00", hours: "8시간" },
      { date: "2024-04-18", start: "09:00", end: "18:00", hours: "8시간" },
      { date: "2024-04-17", start: "09:15", end: "18:00", hours: "7시간 45분" },
      { date: "2024-04-16", start: "09:00", end: "17:30", hours: "7시간 30분" },
    ],
  }), []);
  
  return data;
}