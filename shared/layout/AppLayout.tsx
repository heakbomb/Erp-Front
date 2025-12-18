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
  sidebarFooter?: React.ReactNode; // ✅ [추가] 사이드바 하단 커스텀 영역
  headerActions?: React.ReactNode; // ✅ [추가] 헤더 우측 커스텀 영역 (알림, 프로필 등)
  logoIcon?: LucideIcon;          
  logoText?: string;              
}

export function AppLayout({
  children,
  navigation,
  sidebarHeader,
  sidebarFooter, // ✅ 추가된 Prop
  headerActions, // ✅ 추가된 Prop
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

        {/* 3. ✅ [추가] 사이드바 푸터 */}
        {sidebarFooter && (
          <SidebarFooter>
            {sidebarFooter}
          </SidebarFooter>
        )}
      </Sidebar>

      {/* 4. 메인 콘텐츠 영역 */}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">
                    {navigation.find((nav) => isActive(nav.href))?.name || "Dashboard"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* ✅ [추가] 헤더 우측 액션 (알림, 유저 메뉴 등) */}
          {headerActions && (
            <div className="ml-auto flex items-center gap-2 px-4">
              {headerActions}
            </div>
          )}
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}