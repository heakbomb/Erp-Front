// features/employee/attendance/mobile/components/SimpleQrScanner.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/shared/ui/button";
import jsQR from "jsqr";

export default function SimpleQrScanner({
  onDetectedAction,
  onCloseAction,
}: {
  onDetectedAction: (value: string) => void;
  onCloseAction: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const loop = () => {
          if (stopped) return;
          if (!videoRef.current || !canvasRef.current) {
            raf = requestAnimationFrame(loop);
            return;
          }

          const video = videoRef.current;
          const canvas = canvasRef.current;

          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;

            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
              });

              if (code) {
                onDetectedAction(code.data);
                return;
              }
            }
          }

          raf = requestAnimationFrame(loop);
        };

        raf = requestAnimationFrame(loop);
      } catch (e: any) {
        setError(e?.message || "카메라를 열 수 없습니다.");
      }
    };

    start();

    return () => {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [onDetectedAction]);

  return (
    <div className="flex flex-col gap-2 p-2">
      <video
        ref={videoRef}
        className="w-full aspect-[3/4] bg-black/10 rounded-md object-cover"
        playsInline
        muted
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">QR을 화면 가운데에 맞춰주세요.</p>
      )}
      <Button variant="outline" size="sm" onClick={onCloseAction}>
        닫기
      </Button>
    </div>
  );
}