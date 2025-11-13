// app/owner/purchases/page.tsx
"use client";

// 1. features 폴더에서 실제 페이지 UI를 가져옵니다.
import PurchasesPageFeature from "@/features/purchases/PurchasesPage";

export default function PurchasesPage() {
  // 2. 실제 UI 컴포넌트를 렌더링합니다.
  return <PurchasesPageFeature />;
} 