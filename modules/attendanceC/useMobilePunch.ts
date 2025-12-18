// modules/attendanceC/useMobilePunch.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { attendanceApi } from "./attendanceApi";
import type { MobileAttendanceItem } from "./attendanceTypes";

export function useMobilePunch(opts?: { employeeId?: number; storeId?: number }) {
  const [mounted, setMounted] = useState(false);
  const [canScan, setCanScan] = useState(false);

  // 로그인 붙이기 전 임시값
  const [employeeId] = useState<number>(opts?.employeeId ?? 3);
  const [storeId] = useState<number>(opts?.storeId ?? 11);

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

  // 마운트 체크
  useEffect(() => {
    setMounted(true);
  }, []);

  // 카메라 가능 여부
  useEffect(() => {
    if (!mounted) return;
    const ok =
      typeof window !== "undefined" &&
      window.isSecureContext &&
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function";
    setCanScan(ok);
  }, [mounted]);

  // 최근 기록 불러오기
  const fetchRecent = useCallback(async () => {
    try {
      const data = await attendanceApi.fetchRecentMobileAttendance(employeeId, storeId);
      setRecent((data ?? []).slice(0, 5));
    } catch (err: any) {
      const raw = err?.response?.data || err?.message || "최근 기록을 불러오지 못했습니다.";
      const msg = typeof raw === "string" ? raw : JSON.stringify(raw);
      setBanner({ type: "error", msg });
    }
  }, [employeeId, storeId]);

  useEffect(() => {
    if (!mounted) return;
    fetchRecent();
  }, [mounted, fetchRecent]);

  // 위치 가져오기
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setBanner({ type: "error", msg: "이 브라우저에서는 위치를 사용할 수 없습니다." });
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
        setBanner({ type: "error", msg: "위치 정보를 가져오지 못했습니다. 권한을 확인해주세요." });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  // 출퇴근 기록
  const sendPunch = useCallback(
    async (kind: "IN" | "OUT") => {
      if (!qrCode) {
        setBanner({ type: "error", msg: "QR 코드가 없습니다. 먼저 스캔해주세요." });
        return;
      }
      try {
        await attendanceApi.punchMobileAttendance({
          employeeId,
          storeId,
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
        await fetchRecent();
      } catch (err: any) {
        const raw = err?.response?.data || err?.message || "기록 중 오류가 발생했습니다.";
        const msg = typeof raw === "string" ? raw : JSON.stringify(raw);
        setBanner({ type: "error", msg });
      }
    },
    [qrCode, employeeId, storeId, latitude, longitude, fetchRecent]
  );

  // QR 인식 성공 시
  const handleScanSuccess = useCallback((text: string) => {
    if (!text) return;
    setQrCode(text);
    setShowScanner(false);
    setBanner({ type: "success", msg: "QR을 인식했습니다. 출/퇴근 버튼을 눌러주세요." });
  }, []);

  const handleCloseScanner = useCallback(() => {
    setShowScanner(false);
  }, []);

  const canPunch = useMemo(
    () => !!qrCode && latitude !== null && longitude !== null,
    [qrCode, latitude, longitude]
  );

  return {
    mounted, canScan, employeeId, storeId, qrCode, setQrCode,
    showScanner, setShowScanner, latitude, longitude, gettingLocation,
    recent, banner, getLocation, sendPunch,
    handleScanSuccess, handleCloseScanner, canPunch,
  };
}