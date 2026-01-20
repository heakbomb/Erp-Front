// src/modules/auth/useResetPassword.ts
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "./authApi";
import axios from "axios";

type ErrorBody =
  | string
  | {
      code?: string;
      message?: string;
      details?: Record<string, string>;
    };

function getAlertMessage(err: unknown): string {
  if (!axios.isAxiosError(err)) return "비밀번호 변경에 실패했습니다.";

  const data = err.response?.data as ErrorBody | undefined;

  // 1) 서버가 문자열로 내려준 경우
  if (typeof data === "string" && data.trim()) return data;

  // 2) 서버가 { message } 형태로 내려준 경우
  if (data && typeof data === "object") {
    if (typeof data.message === "string" && data.message.trim()) return data.message;

    // 3) fieldErrors/details가 있다면 첫 메시지 노출(선택)
    if (data.details && typeof data.details === "object") {
      const first = Object.values(data.details).find((v) => typeof v === "string" && v.trim());
      if (first) return first;
    }
  }

  // 4) HTTP 상태별 기본 문구
  const status = err.response?.status;
  if (status === 400) return "요청 값이 올바르지 않습니다.";
  if (status === 401 || status === 403) return "인증이 만료되었습니다. 다시 요청해주세요.";
  if (status === 404) return "유효하지 않은 링크입니다. 다시 요청해주세요.";
  if (status === 409) return "이미 사용된 링크이거나 처리할 수 없습니다.";

  return "비밀번호 변경에 실패했습니다.";
}

export function useResetPassword() {
  const router = useRouter();
  const sp = useSearchParams();

  const token = useMemo(() => sp.get("token") ?? "", [sp]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ─── 프론트 1차 검증 ───
    if (!token) {
      alert("유효하지 않은 링크입니다. 비밀번호 재설정을 다시 요청해주세요.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      alert("비밀번호를 모두 입력해주세요.");
      return;
    }

    if (newPassword.length < 8) {
      alert("비밀번호는 8자리 이상이어야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 중복 제출 방지
    if (isLoading) return;

    setIsLoading(true);
    try {
      await authApi.confirmPasswordReset(token, newPassword);

      alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
      router.replace("/login");
      return;
    } catch (err: unknown) {
      // ✅ 콘솔 출력/throw 없이 사용자에게만 알림
      alert(getAlertMessage(err));
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    token,
    newPassword,
    confirmPassword,
    isLoading,
    setNewPassword,
    setConfirmPassword,
    handleSubmit,
  };
}