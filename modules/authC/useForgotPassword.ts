// src/modules/auth/useForgotPassword.ts
"use client";

import { useState } from "react";
import { authApi } from "./authApi";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    try {
      await authApi.requestPasswordReset(email);
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("요청 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    submitted,
    isLoading,
    setEmail,
    handleSubmit,
  };
}