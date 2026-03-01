// app/reset-password/page.tsx
"use client";

import { Suspense } from "react"; // 추가
import ResetPasswordView from "@/modules/authC/ResetPasswordView";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <ResetPasswordView />
    </Suspense>
  );
}