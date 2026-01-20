// src/modules/auth/useSignUp.ts
"use client";

import { useState } from "react";
import { authApi } from "./authApi";
import type { SignUpRequest } from "./authTypes";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/ui/use-toast";

function pickErrorMessage(e: any) {
  return (
    e?.friendlyMessage ||
    e?.response?.data?.message ||
    (typeof e?.response?.data === "string" ? e.response.data : "") ||
    "회원가입 중 오류가 발생했습니다."
  );
}

export function useSignUp() {
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    storeName: "",
    businessNumber: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const setFieldError = (key: string, message: string) => {
    setFieldErrors((prev) => ({ ...prev, [key]: message }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!form.username?.trim()) errors.username = "이름을 입력해주세요.";
    if (!form.email?.includes("@")) errors.email = "올바른 이메일 형식이 아닙니다.";
    if ((form.password ?? "").length < 8) errors.password = "비밀번호는 8자 이상이어야 합니다.";
    if (form.password !== form.confirmPassword) errors.confirmPassword = "비밀번호가 일치하지 않습니다.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async (verificationId: string | null) => {
    if (!validate()) return;
    if (!verificationId) {
      alert("이메일 인증이 완료되지 않았습니다.");
      return;
    }

    setLoading(true);

    try {
      const requestData: SignUpRequest = {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        verificationId,
      } as any;

      await authApi.signUp(requestData);

      // ✅ 추가: 성공 alert
      alert("회원가입 성공! 로그인 페이지로 이동합니다.");
      toast({ title: "회원가입 성공", description: "사장 로그인 페이지로 이동합니다." });
      router.push("/login"); // 또는 /login/owner
    } catch (e: any) {
      const msg = pickErrorMessage(e);

      // ✅ 이미 가입된 이메일: alert + field error
      if (msg.includes("이미 가입") || msg.toLowerCase().includes("already")) {
        alert("이미 가입된 이메일입니다.");
        setFieldErrors((prev) => ({ ...prev, email: "이미 가입된 이메일입니다." }));
        toast({ variant: "destructive", title: "가입 실패", description: msg });
        return;
      }

      toast({ variant: "destructive", title: "가입 실패", description: msg });
    } finally {
      setLoading(false);
    }
  };

  return { form, loading, fieldErrors, updateField, submit, setFieldError };
}