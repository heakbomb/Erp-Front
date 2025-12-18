// modules/employeeC/useEmployeesQr.ts
"use client";

import { useEffect, useState } from "react";
import { employeeApi } from "./employeeApi";
import type { Banner } from "./employeeTypes";

export default function useEmployeesQr() {
  const [banner, setBanner] = useState<Banner>(null);
  const [openQr, setOpenQr] = useState(false);
  const [qrStoreId, setQrStoreId] = useState<string>("11");
  const [qrToken, setQrToken] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrExpireAt, setQrExpireAt] = useState<string | null>(null);
  const [qrRemainingSec, setQrRemainingSec] = useState<number>(0);

  const bannerShow = (b: Banner) => {
    setBanner(b);
    setTimeout(() => setBanner(null), 2400);
  };

  const loadQr = async (refresh = false) => {
    const idNum = Number(qrStoreId);
    if (!qrStoreId || Number.isNaN(idNum)) {
      bannerShow({ type: "error", message: "유효한 사업장 ID를 입력하세요." });
      return;
    }
    try {
      setQrLoading(true);
      const data = await employeeApi.fetchStoreQr(idNum, refresh);
      const token = typeof data === "string" ? data : data?.qrToken;
      setQrToken(token ?? "");

      if (data?.expireAt) {
        setQrExpireAt(data.expireAt);
        const diffMs = new Date(data.expireAt).getTime() - Date.now();
        setQrRemainingSec(Math.max(0, Math.floor(diffMs / 1000)));
      } else {
        setQrExpireAt(null);
        setQrRemainingSec(0);
      }
    } catch (e: any) {
      bannerShow({ type: "error", message: "QR 로드 실패" });
      setQrToken("");
      setQrRemainingSec(0);
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(() => {
    if (!openQr || !qrStoreId) return;
    loadQr(false);
    const timer = setInterval(() => loadQr(false), 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [openQr, qrStoreId]);

  useEffect(() => {
    if (!openQr || qrRemainingSec <= 0) return;
    const t = setInterval(() => setQrRemainingSec(p => (p <= 1 ? 0 : p - 1)), 1000);
    return () => clearInterval(t);
  }, [openQr, qrRemainingSec]);

  return {
    banner, openQr, setOpenQr,
    qrStoreId, setQrStoreId,
    qrToken, qrLoading, qrRemainingSec,
    loadQr
  };
}