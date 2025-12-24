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

// ✅ 네비게이션 아이템 타입
export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  items?: {
    name: string;
    href: string;
  }[];
}

// AppLayout Props 정의 확장
interface AppLayoutProps {
  children: React.ReactNode;
  navigation: NavItem[];
  sidebarHeader?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  headerActions?: React.ReactNode;
  logoIcon?: LucideIcon;
  logoText?: string;
}

export function AppLayout({
  children,
  navigation,
  sidebarHeader,
  sidebarFooter,
  headerActions,
  logoIcon: LogoIcon,
  logoText,
}: AppLayoutProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/" || href === "/owner" || href === "/employee" || href === "/admin") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const currentTitle =
    navigation.find((nav) => isActive(nav.href))?.name || "Dashboard";

  return (
    <SidebarProvider>
      {/* ✅ collapsible 제거: 닫힘/열림 기능 자체 없음 */}
      <Sidebar className="overflow-visible">
        {/* 1. 사이드바 헤더 */}
        <SidebarHeader className="overflow-visible">
          {sidebarHeader ? (
            <div className="w-full px-2 py-2 overflow-visible min-w-0">
              {sidebarHeader}
            </div>
          ) : LogoIcon && logoText ? (
            <div className="flex items-center gap-2 px-4 py-2 overflow-visible">
              <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <LogoIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                <span className="truncate font-semibold">{logoText}</span>
              </div>
            </div>
          ) : null}
        </SidebarHeader>

        <Separator />

        {/* 2. 사이드바 메뉴 콘텐츠 */}
        <SidebarContent className="overflow-visible">
          <SidebarGroup>
            {/* ✅ 트리거(닫는 버튼) 삭제 */}
            <SidebarGroupLabel className="flex items-center justify-between gap-2 px-3">
              <span className="text-base font-semibold tracking-tight">Menu</span>
            </SidebarGroupLabel>

            <SidebarGroupContent className="overflow-visible">
              <SidebarMenu className="gap-1.5 px-2">
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.name} className="overflow-visible">
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.name}
                      /* ✅ 모션 제거: transition/translate/hover 애니메이션 제거 */
                      className="h-11 rounded-xl px-3 text-[15px] font-medium"
                    >
                      <Link href={item.href} className="flex items-center gap-3 min-w-0">
                        {item.icon && <item.icon className="size-5 shrink-0" />}
                        <span className="truncate">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* 3. 사이드바 푸터 */}
        {sidebarFooter && (
          <SidebarFooter className="overflow-visible">
            <div className="px-2 py-2 overflow-visible">{sidebarFooter}</div>
          </SidebarFooter>
        )}
      </Sidebar>

      {/* 4. 메인 콘텐츠 영역 */}
      <SidebarInset>
        {/* ✅ 모션/전환 제거: transition / group-has 관련 클래스 제거 */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
          <div className="flex items-center gap-2 px-2">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">
                    {currentTitle}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {headerActions && (
            <div className="ml-auto flex items-center gap-2 px-2">
              {headerActions}
            </div>
          )}
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}