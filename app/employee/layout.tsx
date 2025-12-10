"use client";

import { AppLayout } from "@/components/common/AppLayout"; // 👈 공용 레이아웃
import { employeeNavigation } from "@/lib/navigation"; // 👈 공용 네비게이션
import { ChevronDown, Clock } from "lucide-react";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";          // ✅ 추가

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * 직원 레이아웃 전용 사용자 정보 UI
 * (app/employee/layout.tsx의 DropdownMenu 로직 포함)
 */
function EmployeeInfo() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // const { user } = useAuth();
  // 임시 유저/사업장 정보
  const user = { name: "김직원" };
  const mockWorkplaces = [
    { id: 1, name: "홍길동 식당", role: "주방보조" },
    { id: 2, name: "카페 모카", role: "바리스타" },
  ];
  const [currentWorkplace, setCurrentWorkplace] = React.useState(
    mockWorkplaces[0],
  );

  // 👈 mounted가 true일 때만 DropdownMenu 렌더링
  if (!mounted) {
    // 서버 렌더링 시 또는 하이드레이션 전에는 ID가 없는 플레이스홀더를 보여줌
    return (
      <div className="w-full flex items-center gap-3 rounded-lg p-2">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-medium">{user.name.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {currentWorkplace.name}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-3 hover:bg-accent rounded-lg p-2 transition-colors">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium">{user.name.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {currentWorkplace.name}
            </p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>근무 중인 사업장</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {mockWorkplaces.map((workplace) => (
          <DropdownMenuItem
            key={workplace.id}
            onClick={() => setCurrentWorkplace(workplace)}
          >
            {workplace.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // ✅ 현재 경로

  // ✅ 직원 모바일 출퇴근 페이지에서는 사이드바/상단바 제거
  if (pathname === "/employee/attendance/mobile") {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // ⭐️ '설정' 메뉴 필터링 (이름이 '설정'이거나 href에 'settings'가 포함된 경우 제외)
  const filteredNavigation = employeeNavigation.filter(
    (item) => item.name !== "설정" && !item.href.includes("/settings"),
  );

  return (
    <AppLayout
      navigation={filteredNavigation} // ⭐️ 필터링된 네비게이션 전달
      userInfo={<EmployeeInfo />}
      logoIcon={Clock}
      logoText="요식업 ERP"
    >
      {children}
    </AppLayout>
  );
}