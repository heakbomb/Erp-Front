// modules/storeC/useStoreVerify.ts
"use client";

import { useState, useEffect } from "react";
import { storeApi, extractErrorMessage } from "./storeApi";

export type PhoneStep = "IDLE" | "CODE" | "VERIFIED";

export function useStoreVerify(onVerifiedAction?: (info: any) => void) {
  const [open, setOpen] = useState(false);
  
  const [form, setForm] = useState<{ bizNo: string; phone: string }>({ 
    bizNo: "", 
    phone: "" 
  });
  
  const [error, setError] = useState("");

  const [phoneStep, setPhoneStep] = useState<PhoneStep>("IDLE");
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [pollingId, setPollingId] = useState<NodeJS.Timeout | null>(null);

  const [saving, setSaving] = useState(false);
  const [verifiedInfo, setVerifiedInfo] = useState<any | null>(null);

  useEffect(() => {
    return () => {
      if (pollingId) clearInterval(pollingId);
    };
  }, [pollingId]);

  const handlePhoneVerify = async () => {
    // 전화번호 유효성 검사 (010으로 시작하는 11자리 숫자)
    const phoneRegex = /^010\d{8}$/;
    
    if (!form.phone.trim()) {
      alert("전화번호를 입력하세요.");
      return;
    }

    if (!phoneRegex.test(form.phone)) {
      alert("올바른 휴대폰 번호 형식이 아닙니다.\n010으로 시작하는 11자리 숫자로 입력해주세요. (예: 01012345678)");
      return;
    }

    try {
      setPhoneLoading(true);
      setError("");
      const { authCode } = await storeApi.requestPhoneVerification(form.phone);
      setAuthCode(authCode);
      setPhoneStep("CODE");

      const timer = setInterval(async () => {
        try {
          const { status } = await storeApi.pollPhoneVerification(authCode);
          if (status === "VERIFIED") {
            setPhoneStep("VERIFIED");
            setAuthCode(null);
            if (timer) clearInterval(timer);
            setPollingId(null);
          } else if (status === "EXPIRED") {
            setError("인증이 만료되었습니다. 다시 요청해주세요.");
            setPhoneStep("IDLE");
            setAuthCode(null);
            if (timer) clearInterval(timer);
            setPollingId(null);
          }
        } catch {
          // 폴링 에러 무시
        }
      }, 3000);
      setPollingId(timer);
    } catch (e: any) {
      setError(extractErrorMessage(e));
      setPhoneStep("IDLE");
      setAuthCode(null);
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleSave = async () => {
    if (phoneStep !== "VERIFIED" && !form.bizNo.trim()) {
      alert("전화번호 인증과 사업자번호 입력을 완료한 뒤 저장하세요.");
      return;
    }
    if (phoneStep !== "VERIFIED") {
      alert("전화번호 인증을 먼저 완료하세요.");
      return;
    }
    if (!form.bizNo.trim()) {
      alert("사업자번호를 입력하세요. (‘-’ 없이 10자리)");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const bn = await storeApi.verifyBusinessNumber({ bizNo: form.bizNo, phone: form.phone || "" });
      setVerifiedInfo(bn);
      onVerifiedAction?.(bn);
      alert("✅ 사업자 인증이 완료되었습니다.");
      handleClose(false);
    } catch (e: any) {
      setError(extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = (resetVerified = true) => {
    if (pollingId) clearInterval(pollingId);
    setPollingId(null);
    setOpen(false);
    setForm({ bizNo: "", phone: "" });
    setError("");
    setAuthCode(null);
    setPhoneStep("IDLE");
    setPhoneLoading(false);
    setSaving(false);
    if (resetVerified) setVerifiedInfo(null);
  };

  return {
    open,
    form,
    error,
    phoneStep,
    authCode,
    phoneLoading,
    saving,
    verifiedInfo,
    setOpen,
    setForm,
    setError,
    handlePhoneVerify,
    handleSave,
    handleClose,
  };
}