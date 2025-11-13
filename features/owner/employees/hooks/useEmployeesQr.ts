"use client"

import { useEffect, useState } from "react"
import { fetchStoreQr } from "@/features/owner/employees/services/employeesService"

export type Banner = { type: "success" | "error"; message: string } | null

export default function useEmployeesQr() {
  const [banner, setBanner] = useState<Banner>(null)

  const [openQr, setOpenQr] = useState(false)
  const [qrStoreId, setQrStoreId] = useState<string>("11")
  const [qrToken, setQrToken] = useState<string>("")
  const [qrLoading, setQrLoading] = useState(false)
  const [qrExpireAt, setQrExpireAt] = useState<string | null>(null)
  const [qrRemainingSec, setQrRemainingSec] = useState<number>(0)

  const bannerShow = (b: Banner) => {
    setBanner(b)
    setTimeout(() => setBanner(null), 2400)
  }

  const loadQr = async (refresh = false) => {
    const idNum = Number(qrStoreId)
    if (!qrStoreId || Number.isNaN(idNum)) {
      bannerShow({ type: "error", message: "유효한 사업장 ID를 입력하세요." })
      return
    }
    try {
      setQrLoading(true)
      const data = await fetchStoreQr(idNum, refresh)
      const token = typeof data === "string" ? data : data?.qrToken
      setQrToken(token ?? "")

      if (data?.expireAt) {
        setQrExpireAt(data.expireAt)
        const diffMs = new Date(data.expireAt).getTime() - Date.now()
        setQrRemainingSec(Math.max(0, Math.floor(diffMs / 1000)))
      } else {
        setQrExpireAt(null)
        setQrRemainingSec(0)
      }
    } catch (e: any) {
      console.error("QR 불러오기 실패:", e)
      const msg = e?.response?.data || e?.message || "QR을 불러오지 못했습니다."
      bannerShow({ type: "error", message: msg })
      setQrToken("")
      setQrExpireAt(null)
      setQrRemainingSec(0)
    } finally {
      setQrLoading(false)
    }
  }

  // 최초/주기 갱신 동작(네 로직 유지)
  useEffect(() => {
    if (!openQr) return
    if (!qrStoreId) return

    loadQr(false)

    const timer = setInterval(() => {
      loadQr(false)
    }, 5 * 60 * 1000)

    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openQr, qrStoreId])

  useEffect(() => {
    if (!openQr) return
    if (qrRemainingSec <= 0) return

    const t = setInterval(() => {
      setQrRemainingSec((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => clearInterval(t)
  }, [openQr, qrRemainingSec])

  return {
    banner, openQr, qrStoreId, qrToken, qrLoading, qrExpireAt, qrRemainingSec,
    setOpenQr, setQrStoreId,
    loadQr,
  }
}