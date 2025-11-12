"use client";

import { useState } from "react";
import {
  requestPhoneVerification,
  pollPhoneVerification,
  verifyBusinessNumber,
  extractErrorMessage,
} from "@/features/owner/stores/services/storesService";

export type PhoneStep = "IDLE" | "CODE" | "VERIFIED";

export default function useStoresVerify(onVerifiedAction?: (info: any) => void) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ bizNo: "", phone: "" });
  const [error, setError] = useState("");

  const [phoneStep, setPhoneStep] = useState<PhoneStep>("IDLE");
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [pollingId, setPollingId] = useState<NodeJS.Timeout | null>(null);

  const [saving, setSaving] = useState(false);
  const [verifiedInfo, setVerifiedInfo] = useState<any | null>(null);

  const handlePhoneVerify = async () => {
    if (!form.phone.trim()) {
      alert("전화번호를 먼저 입력하세요.");
      return;
    }
    try {
      setPhoneLoading(true);
      setError("");
      const { authCode } = await requestPhoneVerification(form.phone);
      setAuthCode(authCode);
      setPhoneStep("CODE");

      const timer = setInterval(async () => {
        try {
          const { status } = await pollPhoneVerification(authCode);
          if (status === "VERIFIED") {
            setPhoneStep("VERIFIED");
            setAuthCode(null);
            if (pollingId) clearInterval(pollingId);
            setPollingId(null);
          } else if (status === "EXPIRED") {
            setError("인증이 만료되었습니다. 다시 요청해주세요.");
            setPhoneStep("IDLE");
            setAuthCode(null);
            if (pollingId) clearInterval(pollingId);
            setPollingId(null);
          }
        } catch {
          // 폴링 에러는 무시
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
      const bn = await verifyBusinessNumber({ bizNo: form.bizNo, phone: form.phone || "" });
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
    // state
    open,
    form,
    error,
    phoneStep,
    authCode,
    phoneLoading,
    saving,
    verifiedInfo,

    // setters
    setOpen,
    setForm,
    setError,

    // actions
    handlePhoneVerify,
    handleSave,
    handleClose,
  };
}