// modules/employeeC/EmployeesQr.tsx
"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { QrCode } from "lucide-react";
import useEmployeesQr from "./useEmployeesQr";

export default function EmployeesQr() {
  const {
    banner, openQr, setOpenQr, qrStoreId, setQrStoreId,
    qrToken, qrLoading, qrRemainingSec, loadQr
  } = useEmployeesQr();

  return (
    <div className="space-y-4">
      {banner && (
        <div className={`rounded-md border p-3 text-sm ${banner.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {banner.message}
        </div>
      )}

      <Button variant="outline" size="icon" onClick={() => setOpenQr(true)} title="사업장 QR 보기">
        <QrCode className="w-4 h-4" />
      </Button>

      <Dialog open={openQr} onOpenChange={setOpenQr}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>사업장 QR</DialogTitle>
            <DialogDescription>직원 모바일에서 이 QR을 스캔하세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex gap-2 items-center">
              <Input className="w-32" value={qrStoreId} onChange={e => setQrStoreId(e.target.value.replace(/[^0-9]/g, ""))} placeholder="사업장 ID" />
              <Button size="sm" onClick={() => loadQr(false)} disabled={qrLoading}>{qrLoading ? "로딩..." : "불러오기"}</Button>
              <Button size="sm" variant="outline" onClick={() => loadQr(true)} disabled={qrLoading}>재발급</Button>
            </div>
            {qrToken ? (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">QR 값</Label>
                <div className="p-2 rounded border bg-muted break-all text-sm">{qrToken}</div>
                <div className="text-xs">
                  {qrRemainingSec > 0 ? (
                    <span className="text-green-600">남은 시간 {Math.floor(qrRemainingSec / 60).toString().padStart(2, "0")}:{(qrRemainingSec % 60).toString().padStart(2, "0")}</span>
                  ) : (
                    <span className="text-red-600">만료됨</span>
                  )}
                </div>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrToken)}`} alt="QR" className="mt-2 rounded border" />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">사업장 ID를 입력하고 불러오기를 누르세요.</p>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpenQr(false)}>닫기</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}