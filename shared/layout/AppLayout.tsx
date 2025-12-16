// src/shared/layout/AppLayout.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/shared/ui/sidebar";
import { Separator } from "@/shared/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/shared/ui/breadcrumb";
import { LucideIcon } from "lucide-react";

// ✅ 네비게이션 아이템 타입 수정 (navigation.ts 데이터 구조와 일치)
export interface NavItem {
  name: string;  // title -> name 변경
  href: string;  // url -> href 변경
  icon: LucideIcon;
  items?: {
    name: string;
    href: string;
  }[];
}

// AppLayout Props 정의
interface AppLayoutProps {
  children: React.ReactNode;
  navigation: NavItem[];          
  sidebarHeader?: React.ReactNode; 
  logoIcon?: LucideIcon;          
  logoText?: string;              
}

export function AppLayout({
  children,
  navigation,
  sidebarHeader,
  logoIcon: LogoIcon,
  logoText,
}: AppLayoutProps) {
  const pathname = usePathname();

  // 현재 경로와 메뉴 URL이 일치하는지 확인하는 헬퍼
  const isActive = (href: string) => {
    if (href === "/" || href === "/owner" || href === "/employee" || href === "/admin") {
        return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        {/* 1. 사이드바 헤더 */}
        <SidebarHeader>
          {sidebarHeader ? (
            <div className="w-full">{sidebarHeader}</div>
          ) : LogoIcon && logoText ? (
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <LogoIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{logoText}</span>
              </div>
            </div>
          ) : null}
        </SidebarHeader>

        <Separator />

        {/* 2. 사이드바 메뉴 콘텐츠 */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.name}
                    >
                      <Link href={item.href}>
                        {item.icon && <item.icon />}
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          {/* 필요 시 로그아웃 등 추가 */}
        </SidebarFooter>
      </Sidebar>

      {/* 3. 메인 콘텐츠 영역 */}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">
                    {/* 현재 활성화된 메뉴 이름 표시 */}
                    {navigation.find((nav) => isActive(nav.href))?.name || "Dashboard"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}