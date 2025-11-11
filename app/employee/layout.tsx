"use client";

import { AppLayout } from "@/components/common/AppLayout"; // 👈 공용 레이아웃
import { employeeNavigation } from "@/lib/navigation"; // 👈 공용 네비게이션
import { ChevronDown, Clock } from "lucide-react"; //
import React, { useState } from "react"
// (DropdownMenu 등 필요한 shadcn 컴포넌트 임포트)
//
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
  // const { user } = useAuth();
  // 임시 유저/사업장 정보
  const user = { name: "김직원" };
  const mockWorkplaces = [
    { id: 1, name: "홍길동 식당", role: "주방보조" },
    { id: 2, name: "카페 모카", role: "바리스타" },
  ];
  const [currentWorkplace, setCurrentWorkplace] = React.useState(mockWorkplaces[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-3 hover:bg-accent rounded-lg p-2 transition-colors">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium">{user.name.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{currentWorkplace.name}</p>
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

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout
      navigation={employeeNavigation}
      userInfo={<EmployeeInfo />}
      logoIcon={Clock} //
      logoText="요식업 ERP"
    >
      {children}
    </AppLayout>
  );
}