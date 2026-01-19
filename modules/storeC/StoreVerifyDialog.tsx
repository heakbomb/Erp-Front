"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { useStoreVerify } from "./useStoreVerify";

type Props = {
  onVerifiedAction?: (info: any) => void;
  showInlineCard?: boolean;
  trigger?: React.ReactNode;
};

// ✅ 유효시간(초) - 필요하면 바꾸세요
const CODE_EXPIRE_SECONDS = 300;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function formatMMSS(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${pad2(m)}:${pad2(s)}`;
}

export default function StoreVerifyDialog({
  onVerifiedAction,
  showInlineCard = true,
  trigger,
}: Props) {
  const {
    open,
    form,
    error,
    phoneStep,
    authCode,
    phoneLoading,
    saving,
    setOpen,
    setForm,
    handlePhoneVerify,
    handleSave,
    handleClose,
  } = useStoreVerify(onVerifiedAction);

  // ✅ 타이머 상태
  const [leftSec, setLeftSec] = useState<number>(CODE_EXPIRE_SECONDS);
  const expired = phoneStep === "CODE" && leftSec <= 0;

  // ✅ CODE 단계 진입 시 타이머 리셋
  useEffect(() => {
    if (phoneStep === "CODE") setLeftSec(CODE_EXPIRE_SECONDS);
  }, [phoneStep]);

  // ✅ CODE 단계에서만 카운트다운
  useEffect(() => {
    if (phoneStep !== "CODE") return;
    if (!authCode) return; // authCode가 생성된 뒤에만 시작

    const id = window.setInterval(() => {
      setLeftSec((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [phoneStep, authCode]);

  // ✅ 다이얼로그 닫히거나 인증 완료되면 정리(원하면 유지해도 됨)
  useEffect(() => {
    if (!open || phoneStep === "VERIFIED") {
      setLeftSec(CODE_EXPIRE_SECONDS);
    }
  }, [open, phoneStep]);

  const timeText = useMemo(() => formatMMSS(leftSec), [leftSec]);

  return (
    <div className="inline-flex flex-wrap items-start gap-3 align-top max-w-full">
      <Dialog
        open={open}
        onOpenChange={(o) => (o ? setOpen(true) : handleClose(true))}
      >
        <DialogTrigger asChild>
          {trigger ? trigger : <Button variant="outline">사업자 인증</Button>}
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>사업자 번호 인증</DialogTitle>
            <DialogDescription>
              전화번호 인증 → 사업자번호 입력 순으로 진행해주세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="verify-phone">전화번호</Label>
              <Input
                id="verify-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                  if (onlyNumbers.length <= 11) {
                    setForm((p) => ({ ...p, phone: onlyNumbers }));
                  }
                }}
                placeholder="예) 01012345678 (하이픈 없이 입력)"
                maxLength={11}
                disabled={phoneStep === "CODE" || phoneStep === "VERIFIED"}
              />
              {phoneStep === "VERIFIED" && (
                <p className="text-xs text-green-600">
                  전화번호 인증이 완료되었습니다.
                </p>
              )}
            </div>

            {phoneStep === "CODE" && authCode && (
              <div className="p-4 rounded-md bg-slate-100 border border-slate-200 text-sm space-y-2">
                <p className="text-slate-800 font-medium">
                  아래 인증 코드를 확인하신 후,
                </p>
                <div className="bg-white p-3 rounded border text-center my-2">
                  <span className="font-mono text-xl font-bold text-blue-600 tracking-wider">
                    {authCode}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  휴대폰에서 <strong>csmtask@gmail.com</strong> 으로 <br />
                  위 인증 코드를 문자로 전송해주세요.
                </p>

                {/* ✅ 여기! 타이머 표시 */}
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-2">
                  <span>* 전송 후 잠시 기다리시면 자동으로 인증이 완료됩니다.</span>
                  <span className={expired ? "text-rose-500" : "text-slate-500"}>
                    {expired ? "인증번호가 만료되었습니다." : `유효시간 ${timeText}`}
                  </span>
                </p>

                {/* ✅ 만료되면 재인증 유도 버튼(선택) */}
                {expired && (
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePhoneVerify}
                      disabled={phoneLoading}
                    >
                      {phoneLoading ? "재전송 중..." : "인증번호 다시 받기"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="verify-bizNo">사업자번호(‘-’ 없이 10자리)</Label>
              <Input
                id="verify-bizNo"
                inputMode="numeric"
                value={form.bizNo}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    bizNo: e.target.value.replace(/[^0-9]/g, ""),
                  }))
                }
                placeholder="예) 1234567890"
                maxLength={10}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>
            )}
          </div>

          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => handleClose(false)}>
              닫기
            </Button>
            <Button
              variant="outline"
              onClick={handlePhoneVerify}
              disabled={phoneLoading || phoneStep === "CODE" || phoneStep === "VERIFIED"}
            >
              {phoneLoading
                ? "전화번호 인증 중..."
                : phoneStep === "VERIFIED"
                ? "전화번호 인증 완료"
                : "전화번호 인증"}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
