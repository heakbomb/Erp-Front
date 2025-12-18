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

// 에러 메시지 추출 헬퍼 (없으면 간단히 구현)
function extractErrorMessage(e: any): string {
  return e?.response?.data?.message ?? e?.message ?? "알 수 없는 오류가 발생했습니다.";
}

export type Banner = { type: "success" | "error"; message: string } | null;

const todayStr = () => new Date().toISOString().slice(0, 10);
const thisMonthStr = () => todayStr().slice(0, 7); // "YYYY-MM"

export default function useEmployeesAttendance() {
  // ───── 직원 출결 현황(월간 요약) 전용 상태 ─────
  const [summaryStoreIdInput, setSummaryStoreIdInput] = useState<string>("11");
  const [summaryMonth, setSummaryMonth] = useState<string>(thisMonthStr());
  const [summaryEmployeeFilter, setSummaryEmployeeFilter] = useState<string>("all");
  const [summaryItems, setSummaryItems] = useState<EmployeeAttendanceSummary[]>([]);

  // ───── 출퇴근 로그 리스트(일 단위) 전용 상태 ─────
  const [logStoreIdInput, setLogStoreIdInput] = useState<string>("11");
  const [logDate, setLogDate] = useState<string>(todayStr());
  const [logEmployeeFilter, setLogEmployeeFilter] = useState<string>("all");
  const [logs, setLogs] = useState<OwnerAttendanceLogItem[]>([]);

  // 공통
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  const bannerShow = (b: Banner) => {
    setBanner(b);
    if (b) {
      setTimeout(() => setBanner(null), 2400);
    }
  };

  // 1) 직원 출결 현황(월간 요약) 조회
  const loadSummary = async (opts?: { storeId?: number; month?: string }) => {
    const targetStoreId =
      typeof opts?.storeId === "number"
        ? opts.storeId
        : Number(summaryStoreIdInput || "0");

    if (Number.isNaN(targetStoreId) || targetStoreId <= 0) {
      setSummaryItems([]);
      bannerShow({
        type: "error",
        message: "올바른 사업장 ID를 입력해주세요.",
      });
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
      bannerShow({
        type: "error",
        message: extractErrorMessage(e),
      });
      setSummaryItems([]);
    } finally {
      setLoading(false);
    }
  };

  // 2) 출퇴근 로그 리스트 조회
  const loadLogs = async (opts?: { storeId?: number; date?: string }) => {
    const targetStoreId =
      typeof opts?.storeId === "number"
        ? opts.storeId
        : Number(logStoreIdInput || "0");

    if (Number.isNaN(targetStoreId) || targetStoreId <= 0) {
      setLogs([]);
      bannerShow({
        type: "error",
        message: "올바른 사업장 ID를 입력해주세요.",
      });
      return;
    }

    const targetDate = opts?.date || logDate || todayStr();

    try {
      setLoading(true);
      const data = await fetchOwnerAttendanceLogs({
        storeId: targetStoreId,
        date: targetDate,
      });
      setLogs(data || []);
    } catch (e: any) {
      console.error("출퇴근 로그 조회 실패:", e);
      bannerShow({
        type: "error",
        message: extractErrorMessage(e),
      });
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
    logDate,
    logEmployeeFilter,
    logs,
    loading,
    banner,
    stats,
    setSummaryStoreIdInput,
    setSummaryMonth,
    setSummaryEmployeeFilter,
    setLogStoreIdInput,
    setLogDate,
    setLogEmployeeFilter,
    loadSummary,
    loadLogs,
  };
}