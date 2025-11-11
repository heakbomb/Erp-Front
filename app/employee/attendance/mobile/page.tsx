"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Crosshair, QrCode } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import jsQR from "jsqr" // 

// ✅ API 주소 자동 결정
const resolveApiBase = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname
    if (host !== "localhost" && host !== "127.0.0.1") {
      return ""
    }
  }
  return "http://localhost:8080"
}
const API_BASE = resolveApiBase()

// axios 인스턴스
const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  validateStatus: (s) => s >= 200 && s < 300,
})

type Item = { recordTime: string; recordType: "IN" | "OUT" }

// 
// ──────────────────────────────────────────────────────────────────
//   [ 1. ✅ jsqr로 수정된 SimpleQrScanner 컴포넌트 ]
// ──────────────────────────────────────────────────────────────────
//

function SimpleQrScanner({
  onDetected,
  onClose,
}: {
  onDetected: (value: string) => void
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null) // ✅ Canvas 참조 추가
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null
    let raf = 0
    let stopped = false

    const start = async () => {
      try {
        // 1) 카메라 켜기
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        // 2) jsqr 스캔 루프 시작
        const loop = () => {
          if (stopped) return
          if (!videoRef.current || !canvasRef.current) {
            raf = requestAnimationFrame(loop)
            return
          }

          const video = videoRef.current
          const canvas = canvasRef.current
          // 비디오가 준비될 때까지 기다림
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            // Canvas 크기를 비디오 크기에 맞춤
            canvas.height = video.videoHeight
            canvas.width = video.videoWidth
            
            const ctx = canvas.getContext("2d")
            if (ctx) {
              // Canvas에 현재 비디오 프레임을 그림
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
              
              // Canvas에서 이미지 데이터를 가져옴
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
              
              // jsqr로 QR 코드 해독
              const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
              })

              if (code) {
                // QR 코드 인식 성공!
                onDetected(code.data)
                return // 루프 중지
              }
            }
          }
          raf = requestAnimationFrame(loop)
        }
        raf = requestAnimationFrame(loop)

      } catch (e: any) {
        setError(e?.message || "카메라를 열 수 없습니다.")
      }
    }

    start()

    return () => {
      stopped = true
      if (raf) cancelAnimationFrame(raf)
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [onDetected])

  return (
    <div className="flex flex-col gap-2 p-2">
      <video
        ref={videoRef}
        className="w-full aspect-[3/4] bg-black/10 rounded-md object-cover"
        playsInline
        muted
      />
      {/* ✅ jsqr을 위한 숨겨진 Canvas */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : (
        // ✅ BarcodeDetector가 필요 없으므로 hasDetector 관련 로직 제거
        <p className="text-xs text-muted-foreground">QR을 화면 가운데에 맞춰주세요.</p>
      )}
      <Button variant="outline" size="sm" onClick={onClose}>
        닫기
      </Button>
    </div>
  )
}

// 
// ──────────────────────────────────────────────────────────────────
//   [ 2. DigitalClock 컴포넌트 (이전과 동일) ]
// ──────────────────────────────────────────────────────────────────
//

function DigitalClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = useMemo(() => now.toLocaleTimeString("ko-KR", { hour12: false }), [now]);
  const date = useMemo(() => now.toLocaleDateString("ko-KR"), [now]);

  return (
    <div className="text-center mt-2 select-none">
      <div className="text-4xl font-bold tracking-tight">{time}</div>
      <div className="text-sm text-muted-foreground">{date}</div>
    </div>
  );
}


// 
// ──────────────────────────────────────────────────────────────────
//   [ 3. MobilePunchPage 컴포넌트 (이전과 동일) ]
// ──────────────────────────────────────────────────────────────────
//

export default function MobilePunchPage() {
  const [mounted, setMounted] = useState(false)
  const [canScan, setCanScan] = useState(false)

  // 로그인 붙이기 전 임시값
  const [employeeId] = useState<number>(3)
  const [storeId] = useState<number>(11)

  // QR / 위치
  const [qrCode, setQrCode] = useState("")
  const [showScanner, setShowScanner] = useState(false)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)

  // 기록 / 배너
  const [recent, setRecent] = useState<Item[]>([])
  const [banner, setBanner] = useState<{ type: "info" | "error" | "success"; msg: string } | null>({
    type: "info",
    msg: "사업장 QR을 스캔하고 위치를 가져온 뒤 출퇴근을 기록하세요.",
  })

  // ───────── 공통 마운트 ─────────
  useEffect(() => {
    setMounted(true)
  }, [])

  // 카메라 가능 여부
  useEffect(() => {
    if (!mounted) return
    const ok =
      typeof window !== "undefined" &&
      window.isSecureContext &&
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function"
    setCanScan(ok)
  }, [mounted])

  // 최근 기록
  const fetchRecent = useCallback(async () => {
    try {
      const res = await api.get<Item[]>("/api/attendance/recent", {
        params: { employeeId, storeId },
      })
      setRecent((res.data ?? []).slice(0, 5))
    } catch (err: any) {
      const raw = err?.response?.data || err?.message || "최근 기록을 불러오지 못했습니다."
      const msg = typeof raw === "string" ? raw : JSON.stringify(raw)
      setBanner({ type: "error", msg })
    }
  }, [employeeId, storeId])

  useEffect(() => {
    if (!mounted) return
    fetchRecent()
  }, [mounted, fetchRecent])

  // 위치
  const getLocation = () => {
    if (!navigator.geolocation) {
      setBanner({ type: "error", msg: "이 브라우저에서는 위치를 사용할 수 없습니다." })
      return
    }
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude)
        setLongitude(pos.coords.longitude)
        setGettingLocation(false)
        setBanner({ type: "success", msg: "현재 위치를 가져왔습니다." })
      },
      () => {
        setGettingLocation(false)
        setBanner({ type: "error", msg: "위치 정보를 가져오지 못했습니다. 권한을 확인해주세요." })
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
  }

  // 출퇴근 기록
  const sendPunch = async (kind: "IN" | "OUT") => {
    if (!qrCode) {
        setBanner({ type: "error", msg: "QR 코드가 없습니다. 먼저 스캔해주세요." })
        return
    }
    try {
      await api.post("/api/attendance/punch", {
        employeeId,
        storeId,
        recordType: kind,
        qrCode: qrCode,
        latitude,
        longitude,
      })
      toast?.({ title: kind === "IN" ? "출근 기록 완료" : "퇴근 기록 완료" })
      setBanner({
        type: "success",
        msg: kind === "IN" ? "출근이 기록되었습니다." : "퇴근이 기록되었습니다.",
      })
      setQrCode("")
      await fetchRecent()
    } catch (err: any) {
      const raw = err?.response?.data || err?.message || "기록 중 오류가 발생했습니다."
      const msg = typeof raw === "string" ? raw : JSON.stringify(raw)
      toast?.({ title: "기록 실패", description: msg, variant: "destructive" })
      setBanner({ type: "error", msg })
    }
  }

  // ✅ QR 관련 콜백 함수들 (useCallback으로 보호)
  const handleScanSuccess = useCallback((text: string) => {
    if (!text) return
    setQrCode(text)
    setShowScanner(false)
    setBanner({ type: "success", msg: "QR을 인식했습니다. 출/퇴근 버튼을 눌러주세요." })
  }, []) 

  const handleCloseScanner = useCallback(() => {
    setShowScanner(false)
  }, [])

  const canPunch = !!qrCode && latitude !== null && longitude !== null;

  if (!mounted) return null

  return (
    <div className="min-h-dvh p-4 flex flex-col gap-4 max-w-sm mx-auto">
      {banner && (
        <div
          className={
            "rounded-md px-3 py-2 text-sm " +
            (banner.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800")
          }
        >
          {banner.msg}
        </div>
      )}

      {/* ✅ 분리된 시계 컴포넌트 호출 */}
      <DigitalClock />

      {/* QR + 위치 */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            사업장 QR
          </label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="QR 코드 값을 붙여넣거나 스캔하세요"
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={getLocation}
              disabled={gettingLocation}
            >
              {gettingLocation ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Crosshair className="mr-2 h-4 w-4" />
              )}
              위치 가져오기
            </Button>

            <Button
              type="button"
              size="sm"
              className="flex-1"
              onClick={() => {
                if (!canScan) {
                  setBanner({
                    type: "error",
                    msg: "이 환경에서는 카메라를 열 수 없습니다. HTTPS인지 확인하세요.",
                  })
                  return
                }
                setShowScanner((p) => !p)
              }}
            >
              <QrCode className="mr-2 h-4 w-4" />
              {showScanner ? "카메라 닫기" : "QR 스캔"}
            </Button>
          </div>

          <div className="text-[11px] text-muted-foreground">
            {latitude && longitude
              ? `lat: ${latitude.toFixed(5)}, lng: ${longitude.toFixed(5)}`
              : "위치를 아직 가져오지 않았습니다."}
          </div>
        </CardContent>
      </Card>

      {/* ✅ 우리가 만든 스캐너 */}
      {showScanner && (
        <div className="rounded-lg overflow-hidden border bg-black/5">
          <SimpleQrScanner
            onDetected={handleScanSuccess} 
            onClose={handleCloseScanner}   
          />
        </div>
      )}

      {/* ✅ 출근 / 퇴근 버튼 추가 */}
      <div className="grid grid-cols-2 gap-3">
        <Button size="lg" disabled={!canPunch} onClick={() => sendPunch("IN")}>
          출근
        </Button>
        <Button size="lg" variant="destructive" disabled={!canPunch} onClick={() => sendPunch("OUT")}>
          퇴근
        </Button>
      </div>

      {/* 최근 기록 */}
      <Card>
        <CardContent className="p-4">
          <div className="font-medium mb-2">최근 기록</div>
          {recent.length === 0 ? (
            <div className="text-sm text-muted-foreground">기록이 없습니다.</div>
          ) : (
            <div className="space-y-2">
              {recent.map((r, i) => (
                <div key={`${r.recordTime}-${i}`} className="flex justify-between text-sm">
                  <span>{r.recordTime.replace("T", " ").slice(0, 16)}</span>
                  <span className={r.recordType === "IN" ? "text-green-600" : "text-amber-600"}>
                    {r.recordType === "IN" ? "출근" : "퇴근"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}