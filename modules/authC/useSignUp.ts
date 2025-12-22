// src/modules/auth/useSignUp.ts
"use client";

import { useState } from "react";
import { authApi } from "./authApi";
import type { SignUpRequest } from "./authTypes";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/ui/use-toast";

export function useSignUp() {
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    username: "",       // Owner.username
    email: "",          // Owner.email
    password: "",       // Owner.password
    confirmPassword: "",
    storeName: "",      // Store.store_name
    businessNumber: "", // BusinessNumber.biz_num
    phone: "",          // BusinessNumber.phone
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // 에러 상태 초기화
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.username) errors.username = "이름을 입력해주세요.";
    if (!form.email.includes("@")) errors.email = "올바른 이메일 형식이 아닙니다.";
    if (form.password.length < 8) errors.password = "비밀번호는 8자 이상이어야 합니다.";
    if (form.password !== form.confirmPassword) errors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    if (form.businessNumber.replace(/-/g, "").length !== 10) errors.businessNumber = "사업자번호 10자리를 입력해주세요.";
    if (!form.phone) errors.phone = "연락처를 입력해주세요.";
    if (!form.storeName) errors.storeName = "상호명을 입력해주세요.";
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const requestData: SignUpRequest = {
        username: form.username,
        email: form.email,
        password: form.password,
        storeName: form.storeName,
        businessNumber: form.businessNumber.replace(/-/g, ""), // 하이픈 제거 전송
        phone: form.phone.replace(/-/g, ""),
      };

      await authApi.signUp(requestData);
      
      toast({ title: "회원가입 성공", description: "로그인 페이지로 이동합니다." });
      router.push("/login");
    } catch (e: any) {
      toast({ 
        variant: "destructive", 
        title: "가입 실패", 
        description: e.response?.data?.message || "회원가입 중 오류가 발생했습니다." 
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    fieldErrors,
    updateField,
    submit,
  };
}