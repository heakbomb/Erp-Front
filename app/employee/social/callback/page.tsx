"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function EmployeeSocialCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { login } = useAuth();

  const onceRef = useRef(false);

  useEffect(() => {
    if (onceRef.current) return;

    const accessToken = sp.get("accessToken") ?? "";
    const employeeId = sp.get("employeeId") ?? "";
    const error = sp.get("error") ?? "";
    const provider = sp.get("provider") ?? ""; // 백엔드에서 안 주면 빈값

    if (error) {
      onceRef.current = true;
      if (typeof window !== "undefined") alert(error);
      router.replace("/login");
      return;
    }

    if (!accessToken || !employeeId) return;

    onceRef.current = true;

    login(
      {
        employeeId: Number(employeeId),
        role: "EMPLOYEE",
        provider: provider || undefined,
      } as any,
      accessToken
    );

    // 토큰이 주소창에 남지 않게 replace
    router.replace("/employee/search-stores");
  }, [login, router, sp]); // ✅ memo 제거

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="text-sm text-muted-foreground">소셜 로그인 처리 중...</div>
    </div>
  );
}