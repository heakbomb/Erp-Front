// features/owner/employees/hooks/useEmployeesAttendance.ts
"use client";

import { useEffect, useMemo, useState } from "react";

import {
  fetchEmployeesAttendanceSummary,
  fetchOwnerAttendanceLogs,
  extractErrorMessage,
  type EmployeeAttendanceSummary,
  type OwnerAttendanceLogItem,
} from "@/features/owner/employees/services/employeesService";

export type Banner = { type: "success" | "error"; message: string } | null;

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function useEmployeesAttendance() {
  const [storeIdInput, setStoreIdInput] = useState<string>("1");
  const [date, setDate] = useState<string>(todayStr());

  // 요약 카드용 데이터
  const [items, setItems] = useState<EmployeeAttendanceSummary[]>([]);

  // 로그 리스트용 데이터
  const [logs, setLogs] = useState<OwnerAttendanceLogItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  const bannerShow = (b: Banner) => {
    setBanner(b);
    if (b) {
      setTimeout(() => setBanner(null), 2400);
    }
  };

  const load = async (opts?: { storeId?: number; date?: string }) => {
    const targetStoreId =
      typeof opts?.storeId === "number"
        ? opts.storeId
        : Number(storeIdInput || "0");

    if (Number.isNaN(targetStoreId) || targetStoreId <= 0) {
      setItems([]);
      setLogs([]);
      bannerShow({
        type: "error",
        message: "올바른 사업장 ID를 입력해주세요.",
      });
      return;
    }

    const targetDate = opts?.date ?? date;

    try {
      setLoading(true);

      const [summaryData, logData] = await Promise.all([
        fetchEmployeesAttendanceSummary({
          storeId: targetStoreId,
          date: targetDate,
        }),
        fetchOwnerAttendanceLogs({
          storeId: targetStoreId,
          date: targetDate,
        }),
      ]);

      setItems(summaryData || []);
      setLogs(logData || []);
    } catch (e: any) {
      console.error("직원 출결/로그 조회 실패:", e);
      bannerShow({
        type: "error",
        message: extractErrorMessage(e),
      });
      setItems([]);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // 첫 진입 시 자동 로드
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 요약 카드용 통계 (summary API 기준)
  const stats = useMemo(() => {
    const total = items.length;
    const working = items.filter((i) => i.todayStatus === "IN").length;
    const off = items.filter((i) => i.todayStatus === "OUT").length;
    const absent = items.filter((i) => i.todayStatus === "ABSENT").length;

    return { total, working, off, absent };
  }, [items]);

  return {
    // 공통 필터 상태
    storeIdInput,
    date,

    // 요약 카드 데이터
    items,
    stats,

    // 로그 리스트 데이터
    logs,

    // 로딩/배너
    loading,
    banner,

    // setter & actions
    setStoreIdInput,
    setDate,
    load,
  };
}