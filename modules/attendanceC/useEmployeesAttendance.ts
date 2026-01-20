// modules/attendanceC/useEmployeesAttendance.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchEmployeesAttendanceSummary,
  fetchOwnerAttendanceLogs,
} from "./attendanceApi";
import type {
  EmployeeAttendanceSummary,
  OwnerAttendanceLogItem,
} from "./attendanceTypes";

function extractErrorMessage(e: any): string {
  return e?.response?.data?.message ?? e?.message ?? "알 수 없는 오류가 발생했습니다.";
}

export type Banner = { type: "success" | "error"; message: string } | null;

const todayStr = () => new Date().toISOString().slice(0, 10);
const thisMonthStr = () => todayStr().slice(0, 7);

export default function useEmployeesAttendance() {
  // ───── 직원 출결 현황(월간 요약) 전용 상태 ─────
  const [summaryStoreIdInput, setSummaryStoreIdInput] = useState<string>("101");
  const [summaryMonth, setSummaryMonth] = useState<string>(thisMonthStr());
  const [summaryEmployeeFilter, setSummaryEmployeeFilter] = useState<string>("all");
  const [summaryItems, setSummaryItems] = useState<EmployeeAttendanceSummary[]>([]);

  // ───── 출퇴근 로그 리스트(기간) 전용 상태 ─────
  const [logStoreIdInput, setLogStoreIdInput] = useState<string>("101");

  // ✅ 요구사항 2) from/to 상태로 변경 (기본은 오늘~오늘)
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

  const loadSummary = async (opts?: { storeId?: number; month?: string }) => {
    const targetStoreId =
      typeof opts?.storeId === "number"
        ? opts.storeId
        : Number(summaryStoreIdInput || "0");

    if (Number.isNaN(targetStoreId) || targetStoreId <= 0) {
      setSummaryItems([]);
      bannerShow({ type: "error", message: "올바른 사업장 ID를 입력해주세요." });
      return;
    }

    const targetMonth = opts?.month || summaryMonth || thisMonthStr();

    try {
      setLoading(true);
      const data = await fetchEmployeesAttendanceSummary({
        storeId: targetStoreId,
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
  };

  // ✅ 요구사항 2) 기간(from~to) 조회로 변경
  const loadLogs = async (opts?: { storeId?: number; from?: string; to?: string }) => {
    const targetStoreId =
      typeof opts?.storeId === "number"
        ? opts.storeId
        : Number(logStoreIdInput || "0");

    if (Number.isNaN(targetStoreId) || targetStoreId <= 0) {
      setLogs([]);
      bannerShow({ type: "error", message: "올바른 사업장 ID를 입력해주세요." });
      return;
    }

    const from = opts?.from || logFromDate || todayStr();
    const to = opts?.to || logToDate || todayStr();

    try {
      setLoading(true);
      const data = await fetchOwnerAttendanceLogs({
        storeId: targetStoreId,
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
  };

  useEffect(() => {
    loadSummary();
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const totalEmployees = summaryItems.length;
    const totalWorkDays = summaryItems.reduce(
      (sum, i) => sum + (i.workDaysThisMonth ?? 0),
      0,
    );
    const totalWorkHours = summaryItems.reduce(
      (sum, i) => sum + (i.workHoursThisMonth ?? 0),
      0,
    );
    return { totalEmployees, totalWorkDays, totalWorkHours };
  }, [summaryItems]);

  return {
    summaryStoreIdInput,
    summaryMonth,
    summaryEmployeeFilter,
    summaryItems,

    logStoreIdInput,
    logFromDate,
    logToDate,
    logEmployeeFilter,
    logs,

    loading,
    banner,
    stats,

    setSummaryStoreIdInput,
    setSummaryMonth,
    setSummaryEmployeeFilter,

    setLogStoreIdInput,
    setLogFromDate,
    setLogToDate,
    setLogEmployeeFilter,

    loadSummary,
    loadLogs,
  };
}