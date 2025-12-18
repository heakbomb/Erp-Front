"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/shared/layout/AppLayout";
import { ADMIN_NAV_ITEMS } from "@/shared/utils/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import { User, LogOut, Bell, ChevronDown, LayoutDashboard } from "lucide-react";

/**
 * 관리자용 사이드바 하단 (유저 정보 + 로그아웃)
 */
function AdminSidebarFooter() {
  const router = useRouter();
  const auth = useAuth() as any;
  const { logout, user } = auth;

  const handleLogout = async () => {
    try {
      if (logout) await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="p-2">
       {/* 유저 정보 카드 */}
       <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors overflow-hidden">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
             <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0 grid gap-0.5 text-left">
             <p className="text-sm font-medium truncate leading-none">
               {user?.name || user?.username || "관리자"}
             </p>
             <p className="text-xs text-muted-foreground truncate leading-none">
               {user?.email || "admin@example.com"}
             </p>
          </div>
       </div>
       {/* 로그아웃 버튼 */}
       <Button 
         variant="ghost" 
         className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 mt-2 h-9"
         onClick={handleLogout}
       >
         <LogOut className="mr-2 h-4 w-4 shrink-0" />
         <span className="truncate">로그아웃</span>
       </Button>
    </div>
  );
}

/**
 * 관리자용 헤더 우측 액션 (알림 + 드롭다운)
 */
function AdminHeaderActions() {
    const router = useRouter();
    const auth = useAuth() as any;
    const { logout } = auth;

    const handleLogout = async () => {
        try {
            if (logout) await logout();
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-1 h-9">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-primary">A</span>
                  </div>
                  <span className="hidden sm:inline-block text-sm font-medium">관리자</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> 로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout
      navigation={ADMIN_NAV_ITEMS}
      logoIcon={LayoutDashboard}
      logoText="관리자 시스템"
      sidebarFooter={<AdminSidebarFooter />}
      headerActions={<AdminHeaderActions />}
    >
      {children}
    </AppLayout>
  );
}