// modules/attendanceC/useAttendance.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { attendanceApi } from "./attendanceApi";
import type { AttendanceItem } from "./attendanceTypes";

const ymdLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const isoDate = (d: Date) => ymdLocal(d);

export function useAttendance(initialEmployeeId = "3", initialStoreId = "11") {
  // 테스트용(로그인 전): 직원/사업장 ID
  const [employeeId, setEmployeeId] = useState(initialEmployeeId);
  const [storeId, setStoreId] = useState(initialStoreId);

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

  // 최근 기록 불러오기
  const loadRecent = useCallback(async () => {
    if (!employeeId || !storeId) return;
    try {
      setLoadingRecent(true);
      const data = await attendanceApi.fetchRecentAttendance(Number(employeeId), Number(storeId));
      setRecent(data);
      setPage(1);
    } finally {
      setLoadingRecent(false);
    }
  }, [employeeId, storeId]);

  // 특정 일자 기록 불러오기
  const loadDay = useCallback(
    async (d: Date) => {
      if (!employeeId || !storeId) return;
      try {
        setLoadingDay(true);
        const data = await attendanceApi.fetchDayAttendance(
          Number(employeeId),
          Number(storeId),
          isoDate(d)
        );
        setDaily(data);
      } finally {
        setLoadingDay(false);
      }
    },
    [employeeId, storeId]
  );

  // 초기 로드
  useEffect(() => {
    if (!employeeId || !storeId) return;
    loadRecent();
    if (date) loadDay(date);
  }, [employeeId, storeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 날짜 바뀌면 그날 데이터 다시
  useEffect(() => {
    if (date) loadDay(date);
  }, [date, loadDay]);

  // 출퇴근
  const punch = useCallback(
    async (kind: "IN" | "OUT") => {
      if (!employeeId || !storeId) {
        alert("직원 ID와 사업장 ID를 입력하세요.");
        return;
      }
      try {
        setPunching(kind);
        const now = new Date().toISOString();

        // 낙관적 UI
        const optimistic: AttendanceItem = {
          logId: -Date.now(),
          employeeId: Number(employeeId),
          storeId: Number(storeId),
          recordTime: now,
          recordType: kind,
        };
        setRecent((prev) => [optimistic, ...prev]);

        await attendanceApi.punchAttendance({
          employeeId: Number(employeeId),
          storeId: Number(storeId),
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
    [employeeId, storeId, date, loadRecent, loadDay]
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
    employeeId, storeId, date, visibleMonth, ymOpen,
    recent, daily, loadingRecent, loadingDay, punching,
    page, totalPages, pagedRecent, modifiers, dayHasIn, dayHasOut,
    setEmployeeId, setStoreId, setDate, setVisibleMonth, setYmOpen, setPage,
    loadRecent, loadDay, punch,
  };
}