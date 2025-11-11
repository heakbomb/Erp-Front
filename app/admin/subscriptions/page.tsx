"use client";

// 1. features 폴더에서 실제 페이지 UI를 가져옵니다.
import AdminSubscriptionsPageFeature from "@/features/admin/subscriptions/AdminSubscriptionsPageFeature";

// 2. Admin 레이아웃 내부에 '알맹이'를 렌더링합니다.
export default function AdminSubscriptionsPage() {
  return <AdminSubscriptionsPageFeature />;
}