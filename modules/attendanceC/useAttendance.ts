// modules/attendanceC/useAttendance.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { attendanceApi } from "./attendanceApi";
import type { AttendanceItem } from "./attendanceTypes";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";

const ymdLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const isoDate = (d: Date) => ymdLocal(d);

export function useAttendance() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const { currentStoreId } = useStore();

  // ✅ 로그인 기반 employeeId (EMPLOYEE만)
  const employeeIdNum: number | null = useMemo(() => {
    const role = String(user?.role ?? "").toUpperCase();
    if (!isLoggedIn || role !== "EMPLOYEE") return null;

    const v = user?.employeeId ?? user?.employee_id ?? null;
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(n) && n > 0 ? (n as number) : null;
  }, [user, isLoggedIn]);

  // ✅ 사업장 ID: StoreContext 기준
  const storeIdNum: number | null = useMemo(() => {
    const n = typeof currentStoreId === "string" ? Number(currentStoreId) : currentStoreId;
    return Number.isFinite(n) && (n as number) > 0 ? (n as number) : null;
  }, [currentStoreId]);

  // UI 표시용(기존 컴포넌트와 호환 위해 string 유지)
  const employeeId = employeeIdNum ? String(employeeIdNum) : "";
  const storeId = storeIdNum ? String(storeIdNum) : "";

  // 날짜와 달력 월
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
  const [ymOpen, setYmOpen] = useState(false);

  // 데이터 상태
  const [recent, setRecent] = useState<AttendanceItem[]>([]);
  const [daily, setDaily] = useState<AttendanceItem[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [loadingDay, setLoadingDay] = useState(false);
  const [punching, setPunching] = useState<"IN" | "OUT" | null>(null);

  // 페이징
  const pageSize = 10;
  const [page, setPage] = useState(1);

  const canQuery = !authLoading && isLoggedIn && !!employeeIdNum && !!storeIdNum;

  // 최근 기록 불러오기
  const loadRecent = useCallback(async () => {
    if (!canQuery) return;
    try {
      setLoadingRecent(true);
      const data = await attendanceApi.fetchRecentAttendance(employeeIdNum!, storeIdNum!);
      setRecent(data);
      setPage(1);
    } finally {
      setLoadingRecent(false);
    }
  }, [canQuery, employeeIdNum, storeIdNum]);

  // 특정 일자 기록 불러오기
  const loadDay = useCallback(
    async (d: Date) => {
      if (!canQuery) return;
      try {
        setLoadingDay(true);
        const data = await attendanceApi.fetchDayAttendance(employeeIdNum!, storeIdNum!, isoDate(d));
        setDaily(data);
      } finally {
        setLoadingDay(false);
      }
    },
    [canQuery, employeeIdNum, storeIdNum]
  );

  // 초기 로드 (로그인/사업장 준비되면)
  useEffect(() => {
    if (!canQuery) {
      // ✅ 로그인/사업장 없으면 기존 데이터 초기화(표시 안정)
      setRecent([]);
      setDaily([]);
      setPage(1);
      return;
    }
    loadRecent();
    if (date) loadDay(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canQuery, employeeIdNum, storeIdNum]);

  // 날짜 바뀌면 그날 데이터 다시
  useEffect(() => {
    if (!canQuery) return;
    if (date) loadDay(date);
  }, [date, loadDay, canQuery]);

  // 출퇴근
  const punch = useCallback(
    async (kind: "IN" | "OUT") => {
      if (!canQuery) {
        alert("로그인 및 사업장 선택 후 이용할 수 있습니다.");
        return;
      }

      try {
        setPunching(kind);
        const now = new Date().toISOString();

        // 낙관적 UI (기존 그대로)
        const optimistic: AttendanceItem = {
          logId: -Date.now(),
          employeeId: employeeIdNum!,
          storeId: storeIdNum!,
          recordTime: now,
          recordType: kind,
        };
        setRecent((prev) => [optimistic, ...prev]);

        await attendanceApi.punchAttendance({
          employeeId: employeeIdNum!,
          storeId: storeIdNum!,
          recordTime: now,
          recordType: kind,
        });

        await Promise.all([loadRecent(), date ? loadDay(date) : Promise.resolve()]);
        alert(kind === "IN" ? "출근이 기록되었습니다." : "퇴근이 기록되었습니다.");
      } catch (e: any) {
        console.error(e);
        // 낙관적 추가 복구
        setRecent((prev) => prev.filter((x) => x.logId >= 0));
        alert(e?.response?.data || e?.message || "기록 중 오류가 발생했습니다.");
      } finally {
        setPunching(null);
      }
    },
    [canQuery, employeeIdNum, storeIdNum, date, loadRecent, loadDay]
  );

  // 여러 계산값들
  const totalPages = Math.max(1, Math.ceil(recent.length / pageSize));
  const pagedRecent = useMemo(() => {
    const start = (page - 1) * pageSize;
    return recent.slice(start, start + pageSize);
  }, [recent, page]);

  const datesWithRecords = useMemo(() => {
    const set = new Set<string>();
    recent.forEach((r) => set.add(ymdLocal(new Date(r.recordTime))));
    daily.forEach((r) => set.add(ymdLocal(new Date(r.recordTime))));
    return set;
  }, [recent, daily]);

  const modifiers = useMemo(
    () => ({
      hasRecord: (d: Date) => datesWithRecords.has(ymdLocal(d)),
    }),
    [datesWithRecords]
  );

  const dayHasIn = daily.some((d) => d.recordType === "IN");
  const dayHasOut = daily.some((d) => d.recordType === "OUT");

  return {
    employeeId,
    storeId,
    date,
    visibleMonth,
    ymOpen,

    recent,
    daily,
    loadingRecent,
    loadingDay,
    punching,

    page,
    totalPages,
    pagedRecent,
    modifiers,
    dayHasIn,
    dayHasOut,

    // ✅ UI/UX 유지 목적: setter를 남기되(기존 컴포넌트 호환),
    // 실제 API에는 반영되지 않게 차단(보안).
    setEmployeeId: (_: string) => { },
    setStoreId: (_: string) => { },
    setDate,
    setVisibleMonth,
    setYmOpen,
    setPage,

    loadRecent,
    loadDay,
    punch,
  };
}