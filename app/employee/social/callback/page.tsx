// app/employee/social/callback/page.tsx
"use client";

import { useEffect, useRef, Suspense } from "react"; // Suspense 추가
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// 로직을 담은 별도 컴포넌트 분리
function CallbackContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const { login } = useAuth();
  const onceRef = useRef(false);

  useEffect(() => {
    if (onceRef.current) return;

    const accessToken = sp.get("accessToken") ?? "";
    const employeeId = sp.get("employeeId") ?? "";
    const error = sp.get("error") ?? "";
    const provider = sp.get("provider") ?? "";

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

    router.replace("/employee/search-stores");
  }, [login, router, sp]);

  return <div className="text-sm text-muted-foreground">소셜 로그인 처리 중...</div>;
}

// 메인 페이지 컴포넌트
export default function EmployeeSocialCallbackPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Suspense fallback={<div>처리 중...</div>}>
        <CallbackContent />
      </Suspense>
    </div>
  );
}