"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { fetchEmployeesAttendanceSummary, fetchOwnerAttendanceLogs } from "./attendanceApi";
import type { EmployeeAttendanceSummary, OwnerAttendanceLogItem } from "./attendanceTypes";
import { useStore } from "@/contexts/StoreContext";

function extractErrorMessage(e: any): string {
  return e?.response?.data?.message ?? e?.message ?? "알 수 없는 오류가 발생했습니다.";
}

export type Banner = { type: "success" | "error"; message: string } | null;

const todayStr = () => new Date().toISOString().slice(0, 10);
const thisMonthStr = () => todayStr().slice(0, 7);

export default function useEmployeesAttendance() {
  const { currentStoreId } = useStore();

  // ───── 직원 출결 현황(월간 요약) 전용 상태 ─────
  const [summaryMonth, setSummaryMonth] = useState<string>(thisMonthStr());
  const [summaryEmployeeFilter, setSummaryEmployeeFilter] = useState<string>("all");
  const [summaryItems, setSummaryItems] = useState<EmployeeAttendanceSummary[]>([]);

  // ───── 출퇴근 로그 리스트(기간) 전용 상태 ─────
  const [logFromDate, setLogFromDate] = useState<string>(todayStr());
  const [logToDate, setLogToDate] = useState<string>(todayStr());
  const [logEmployeeFilter, setLogEmployeeFilter] = useState<string>("all");
  const [logs, setLogs] = useState<OwnerAttendanceLogItem[]>([]);

  // 공통
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  const bannerShow = (b: Banner) => {
    setBanner(b);
    if (b) setTimeout(() => setBanner(null), 2400);
  };

  const loadSummary = useCallback(
    async (opts?: { month?: string }) => {
      if (!currentStoreId) {
        setSummaryItems([]);
        return;
      }

      const targetMonth = opts?.month || summaryMonth || thisMonthStr();

      try {
        setLoading(true);
        const data = await fetchEmployeesAttendanceSummary({
          storeId: currentStoreId,
          month: targetMonth,
        });
        setSummaryItems(data || []);
      } catch (e: any) {
        console.error("직원 월간 출결 요약 조회 실패:", e);
        bannerShow({ type: "error", message: extractErrorMessage(e) });
        setSummaryItems([]);
      } finally {
        setLoading(false);
      }
    },
    [currentStoreId, summaryMonth]
  );

  const loadLogs = useCallback(
    async (opts?: { from?: string; to?: string }) => {
      if (!currentStoreId) {
        setLogs([]);
        return;
      }

      const from = opts?.from || logFromDate || todayStr();
      const to = opts?.to || logToDate || todayStr();

      try {
        setLoading(true);
        const data = await fetchOwnerAttendanceLogs({
          storeId: currentStoreId,
          from,
          to,
        });
        setLogs(data || []);
      } catch (e: any) {
        console.error("출퇴근 로그 조회 실패:", e);
        bannerShow({ type: "error", message: extractErrorMessage(e) });
        setLogs([]);
      } finally {
        setLoading(false);
      }
    },
    [currentStoreId, logFromDate, logToDate]
  );

  // ✅ currentStoreId 생기면 자동 로딩 (로그인/사업장 선택 흐름 대응)
  useEffect(() => {
    if (!currentStoreId) {
      setSummaryItems([]);
      setLogs([]);
      return;
    }
    void loadSummary();
    void loadLogs();
  }, [currentStoreId, loadSummary, loadLogs]);

  const stats = useMemo(() => {
    const totalEmployees = summaryItems.length;
    const totalWorkDays = summaryItems.reduce((sum, i) => sum + (i.workDaysThisMonth ?? 0), 0);
    const totalWorkHours = summaryItems.reduce((sum, i) => sum + (i.workHoursThisMonth ?? 0), 0);
    return { totalEmployees, totalWorkDays, totalWorkHours };
  }, [summaryItems]);

  return {
    summaryMonth,
    summaryEmployeeFilter,
    summaryItems,

    logFromDate,
    logToDate,
    logEmployeeFilter,
    logs,

    loading,
    banner,
    stats,

    setSummaryMonth,
    setSummaryEmployeeFilter,

    setLogFromDate,
    setLogToDate,
    setLogEmployeeFilter,

    loadSummary,
    loadLogs,
  };
}