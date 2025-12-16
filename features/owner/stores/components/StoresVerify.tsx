"use client";

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

import { useStoresVerify } from "@/features/owner/stores/hooks/useStoresVerify";

type StoresVerifyProps = {
  onVerifiedAction?: (info: any) => void;
  showInlineCard?: boolean;
};

export default function StoresVerify({
  onVerifiedAction,
  showInlineCard = true,
}: StoresVerifyProps) {
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
  } = useStoresVerify(onVerifiedAction);

  return (
    <div className="inline-flex flex-wrap items-start gap-3 align-top max-w-full">
      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : handleClose(true))}>
        <DialogTrigger asChild>
          <Button variant="outline">사업자 인증</Button>
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
                <p className="text-xs text-green-600">전화번호 인증이 완료되었습니다.</p>
              )}
            </div>

            {/* ✅ [수정] 인증 코드 안내 문구 변경 */}
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
                  휴대폰에서 <strong>csmtask@gmail.com</strong> 으로 <br/>
                  위 인증 코드를 문자로 전송해주세요.
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  * 전송 후 잠시 기다리시면 자동으로 인증이 완료됩니다.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="verify-bizNo">사업자번호(‘-’ 없이 10자리)</Label>
              <Input
                id="verify-bizNo"
                inputMode="numeric"
                value={form.bizNo}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bizNo: e.target.value.replace(/[^0-9]/g, "") }))
                }
                placeholder="예) 1234567890"
                maxLength={10}
              />
            </div>

            {error && <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>}
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