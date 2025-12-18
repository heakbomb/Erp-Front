// modules/attendanceC/MobilePunchPage.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Loader2, Crosshair, QrCode } from "lucide-react";
import { useMobilePunch } from "./useMobilePunch";
import SimpleQrScanner from "./SimpleQrScanner";

function DigitalClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString("ko-KR", { hour12: false });
  const date = now.toLocaleDateString("ko-KR");

  return (
    <div className="text-center mt-2 select-none">
      <div className="text-4xl font-bold tracking-tight">{time}</div>
      <div className="text-sm text-muted-foreground">{date}</div>
    </div>
  );
}

export default function MobilePunchPage() {
  const {
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
  } = useMobilePunch();

  // 🔥 오늘 출근/퇴근 여부 기반 버튼 활성화 상태 계산
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayRecords = recent.filter((r) =>
    r.recordTime.startsWith(todayKey)
  );

  const hasInToday = todayRecords.some((r) => r.recordType === "IN");
  const hasOutToday = todayRecords.some((r) => r.recordType === "OUT");

  const canClockIn = canPunch && !hasInToday;
  const canClockOut = canPunch && hasInToday && !hasOutToday;

  if (!mounted) return null;

  return (
    <div className="min-h-dvh p-4 flex flex-col gap-4 max-w-sm mx-auto">
      {banner && (
        <div
          className={
            "rounded-md px-3 py-2 text-sm " +
            (banner.type === "success"
              ? "bg-green-100 text-green-800"
              : banner.type === "error"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800")
          }
        >
          {banner.msg}
        </div>
      )}

      <DigitalClock />

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
                  alert("이 환경에서는 카메라를 열 수 없습니다. HTTPS인지 확인하세요.");
                  return;
                }
                setShowScanner((p) => !p);
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

      {showScanner && (
        <div className="rounded-lg overflow-hidden border bg-black/5">
          <SimpleQrScanner
            onDetectedAction={handleScanSuccess}
            onCloseAction={handleCloseScanner}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button
          size="lg"
          disabled={!canClockIn}
          onClick={() => sendPunch("IN")}
        >
          출근
        </Button>
        <Button
          size="lg"
          variant="destructive"
          disabled={!canClockOut}
          onClick={() => sendPunch("OUT")}
        >
          퇴근
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="font-medium mb-2">최근 기록</div>
          {recent.length === 0 ? (
            <div className="text-sm text-muted-foreground">기록이 없습니다.</div>
          ) : (
            <div className="space-y-2">
              {recent.map((r, i) => (
                <div
                  key={`${r.recordTime}-${i}`}
                  className="flex justify-between text-sm"
                >
                  <span>{r.recordTime.replace("T", " ").slice(0, 16)}</span>
                  <span
                    className={
                      r.recordType === "IN" ? "text-green-600" : "text-amber-600"
                    }
                  >
                    {r.recordType === "IN" ? "출근" : "퇴근"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}