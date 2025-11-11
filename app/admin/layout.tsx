"use client";

import type React from "react";
import { AppLayout } from "@/components/common/AppLayout"; // 👈 공용 레이아웃
import { adminNavigation } from "@/lib/navigation"; // 👈 공용 네비게이션
import { Building2 } from "lucide-react"; //

/**
 * 관리자 레이아웃 전용 사용자 정보 UI (간단 버전)
 */
function AdminInfo() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-sm font-medium">A</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">관리자</p>
        <p className="text-xs text-muted-foreground truncate">시스템 관리</p>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout
      navigation={adminNavigation}
      userInfo={<AdminInfo />}
      logoIcon={Building2} //
      logoText="관리자"
    >
      {children}
    </AppLayout>
  );
}