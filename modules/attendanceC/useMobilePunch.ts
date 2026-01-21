"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { attendanceApi } from "./attendanceApi";
import type {
  AttendanceShiftStatus,
  MobileAttendanceItem,
  EmployeeShift,
} from "./attendanceTypes";

import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";

/* ================= utils ================= */

// 로컬 날짜 YYYY-MM-DD
function getLocalDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// "HH:mm:ss" → "HH:mm"
function hhmm(t: string) {
  return (t ?? "").slice(0, 5);
}

/* ================= hook ================= */

export function useMobilePunch(opts?: { employeeId?: number; storeId?: number }) {
  const [mounted, setMounted] = useState(false);
  const [canScan, setCanScan] = useState(false);

  // ✅ 로그인/사업장 컨텍스트
  const { employeeId: ctxEmployeeId, isLoggedIn, isLoading: authLoading } = useAuth();
  const { currentStoreId, isLoading: storeLoading } = useStore();

  // ✅ 최종 employeeId/storeId (opts 우선 → 없으면 context)
  const employeeId = useMemo<number | null>(() => {
    const v = opts?.employeeId ?? ctxEmployeeId;
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  }, [opts?.employeeId, ctxEmployeeId]);

  const storeId = useMemo<number | null>(() => {
    const v = opts?.storeId ?? currentStoreId;
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  }, [opts?.storeId, currentStoreId]);

  // ✅ API 호출 가능 조건 (하드코딩 제거의 핵심)
  const ready = useMemo(() => {
    if (authLoading || storeLoading) return false;
    if (!mounted) return false;
    // 직원 페이지이므로 로그인 & employeeId 필수
    if (!isLoggedIn || !employeeId) return false;
    // 현재 사업장 선택 필수
    if (!storeId) return false;
    return true;
  }, [authLoading, storeLoading, mounted, isLoggedIn, employeeId, storeId]);

  // QR / 위치
  const [qrCode, setQrCode] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // 기록 / 배너
  const [recent, setRecent] = useState<MobileAttendanceItem[]>([]);
  const [banner, setBanner] = useState<{ type: "info" | "error" | "success"; msg: string } | null>({
    type: "info",
    msg: "사업장 QR을 스캔하고 위치를 가져온 뒤 출퇴근을 기록하세요.",
  });

  // shift (표시용 유지)
  const [todayShifts, setTodayShifts] = useState<EmployeeShift[]>([]);
  const [currentShift, setCurrentShift] = useState<EmployeeShift | null>(null);

  // ✅ 상태 API 결과(버튼 판정의 기준)
  const [status, setStatus] = useState<AttendanceShiftStatus | null>(null);

  /* ========== mount / env ========== */

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const ok =
      typeof window !== "undefined" &&
      window.isSecureContext &&
      !!navigator?.mediaDevices?.getUserMedia;
    setCanScan(ok);
  }, [mounted]);

  /* ========== shift fetch (표시/현재 shift 계산용 유지) ========== */

  useEffect(() => {
    if (!ready) return;
    const today = getLocalDateKey();

    attendanceApi
      .fetchShifts({ storeId: storeId as number, from: today, to: today })
      .then(setTodayShifts)
      .catch(() => setTodayShifts([]));
  }, [ready, storeId]);

  useEffect(() => {
    if (todayShifts.length === 0) {
      setCurrentShift(null);
      return;
    }

    const now = new Date();
    const nowTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const matched = todayShifts.find((s) => {
      const start = hhmm(s.startTime);
      const end = hhmm(s.endTime);
      return start <= nowTime && nowTime <= end;
    });

    setCurrentShift(matched ?? null);
  }, [todayShifts]);

  /* ========== recent logs (표시용) ========== */

  const fetchRecent = useCallback(async () => {
    if (!ready) return;
    try {
      const data = await attendanceApi.fetchRecentMobileAttendance(
        employeeId as number,
        storeId as number,
      );
      setRecent((data ?? []).slice(0, 20));
    } catch (err: any) {
      const raw = err?.response?.data ?? err?.message ?? "최근 기록을 불러오지 못했습니다.";
      const msg = typeof raw === "string" ? raw : JSON.stringify(raw);
      setBanner({ type: "error", msg });
    }
  }, [ready, employeeId, storeId]);

  /* ========== ✅ shift status (버튼 판정용) ========== */

  const fetchStatus = useCallback(async () => {
    if (!ready) return;
    try {
      const s = await attendanceApi.fetchAttendanceShiftStatus(
        employeeId as number,
        storeId as number,
      );
      setStatus(s);
    } catch {
      // status API 실패 시 안전하게 버튼 다 막기
      setStatus({
        shiftId: null,
        shiftDate: null,
        canClockIn: false,
        canClockOut: false,
        message: "상태 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.",
      });
    }
  }, [ready, employeeId, storeId]);

  useEffect(() => {
    if (!ready) return;
    fetchRecent();
    fetchStatus();
  }, [ready, fetchRecent, fetchStatus]);

  /* ========== location ========== */

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setBanner({ type: "error", msg: "위치를 사용할 수 없습니다." });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setGettingLocation(false);
        setBanner({ type: "success", msg: "현재 위치를 가져왔습니다." });
      },
      () => {
        setGettingLocation(false);
        setBanner({ type: "error", msg: "위치 정보를 가져오지 못했습니다." });
      },
    );
  }, []);

  /* ========== punch 가능 전제 ========== */

  // ✅ QR + 위치만 확인 (shift 여부는 status/currentShift가 판단)
  const canPunch = useMemo(
    () => !!qrCode && latitude !== null && longitude !== null,
    [qrCode, latitude, longitude],
  );

  /* ========== ✅ 버튼 활성화: status를 단일 기준으로 ========== */

  const canClockIn = useMemo(() => !!status?.canClockIn && canPunch, [status, canPunch]);
  const canClockOut = useMemo(() => !!status?.canClockOut && canPunch, [status, canPunch]);

  /* ========== status message 보정 ========== */
  useEffect(() => {
    if (!mounted) return;
    if (!status) return;

    if (status.message) return;

    const msg = !canPunch
      ? "QR 스캔과 위치 확인 후 출퇴근이 가능합니다."
      : canClockOut
      ? "퇴근 가능합니다."
      : canClockIn
      ? "출근 가능합니다."
      : "이미 출퇴근이 완료되었습니다.";

    setStatus((prev) => (prev ? { ...prev, message: msg } : prev));
  }, [mounted, status, canPunch, canClockIn, canClockOut]);

  /* ========== punch ========== */

  const sendPunch = useCallback(
    async (kind: "IN" | "OUT") => {
      if (!ready) return;

      // ✅ 프론트에서 1차 차단 (409 거의 안 나게)
      if (kind === "IN" && !canClockIn) return;
      if (kind === "OUT" && !canClockOut) return;

      const shiftId = status?.shiftId;
      if (!shiftId) {
        setBanner({ type: "error", msg: status?.message ?? "현재 근무 시간이 아닙니다." });
        return;
      }

      try {
        await attendanceApi.punchMobileAttendance({
          employeeId: employeeId as number,
          storeId: storeId as number,
          shiftId,
          recordType: kind,
          qrCode,
          latitude,
          longitude,
        });

        setBanner({
          type: "success",
          msg: kind === "IN" ? "출근이 기록되었습니다." : "퇴근이 기록되었습니다.",
        });

        setQrCode("");

        // ✅ 성공 후 status 먼저 갱신 → 버튼 즉시 반영
        await fetchStatus();
        await fetchRecent();
      } catch (err: any) {
        const raw = err?.response?.data ?? err?.message ?? "출퇴근 처리 중 오류가 발생했습니다.";
        const msg = typeof raw === "string" ? raw : JSON.stringify(raw);
        setBanner({ type: "error", msg });

        // 서버와 싱크 맞추기
        await fetchStatus();
      }
    },
    [
      ready,
      employeeId,
      storeId,
      status,
      qrCode,
      latitude,
      longitude,
      canClockIn,
      canClockOut,
      fetchRecent,
      fetchStatus,
    ],
  );

  /* ========== QR ========== */

  const handleCloseScanner = useCallback(() => {
    setShowScanner(false);
  }, []);

  const handleScanSuccess = useCallback((text: string) => {
    setQrCode(text);
    setShowScanner(false);
    setBanner({ type: "success", msg: "QR 인식 완료" });
  }, []);

  return {
    mounted,
    canScan,
    qrCode,
    setQrCode,
    showScanner,
    setShowScanner,
    latitude,
    longitude,
    gettingLocation,
    recent,
    banner,
    getLocation,
    sendPunch,
    handleScanSuccess,
    handleCloseScanner,
    canPunch,

    // 페이지에서 사용
    currentShift, // 표시용(있어도 되고 없어도 됨)
    status,
    canClockIn,
    canClockOut,
  };
}