// app/employee/layout.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppLayout } from "@/shared/layout/AppLayout";
import { EMPLOYEE_NAV_ITEMS } from "@/shared/utils/navigation";
import { StoreProvider, useStore } from "@/contexts/StoreContext"; // ✅ useStore 추가
import { ChevronDown, Clock, Check, LogOut } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeeProfile, useEmployeeStores } from "@/modules/employeeC/useEmployeeProfile";

/**
 * ✅ 직원 영역에서 "비로그인 접근 허용"해야 하는 예외 경로들
 */
function isPublicEmployeePath(pathname: string) {
  if (pathname === "/employee/social/callback") return true;
  if (pathname.startsWith("/employee/social/callback/")) return true;
  return false;
}

// ✅ 직원 store 선택값 저장 키 (사장쪽과 충돌 방지)
const EMPLOYEE_STORE_LS_KEY = "employeeCurrentStoreId";

function EmployeeInfo() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const { currentStoreId, setCurrentStoreId } = useStore(); // ✅ 전역 storeId 사용

  const employeeId: number | null = useMemo(() => {
    const id = (user as any)?.employeeId ?? (user as any)?.employee_id ?? null;
    const n = Number(id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [user]);

  const safeEmployeeId = employeeId ?? 0;

  const { profile, isLoading: isProfileLoading } = useEmployeeProfile(safeEmployeeId);
  const { stores, isLoading: isStoresLoading } = useEmployeeStores(safeEmployeeId);

  const [open, setOpen] = useState(false);

  // ✅ stores 로딩 후: localStorage 복원 → 없으면 첫 매장 선택
  useEffect(() => {
    if (!stores || stores.length === 0) return;

    // 이미 전역 storeId가 있고, 현재 stores에 존재하면 그대로 둠
    if (currentStoreId && stores.some((s) => s.storeId === currentStoreId)) return;

    const saved = Number(localStorage.getItem(EMPLOYEE_STORE_LS_KEY));
    const restored =
      Number.isFinite(saved) && saved > 0 && stores.some((s) => s.storeId === saved) ? saved : null;

    const nextId = restored ?? stores[0].storeId;
    setCurrentStoreId(nextId);
    localStorage.setItem(EMPLOYEE_STORE_LS_KEY, String(nextId));
  }, [stores, currentStoreId, setCurrentStoreId]);

  const isLoading = authLoading || isProfileLoading || isStoresLoading;

  const displayName = profile?.name ?? "직원";

  const selectedStoreId = currentStoreId ?? null;
  const currentStore = stores.find((s) => s.storeId === selectedStoreId) ?? stores[0];
  const currentStoreName = currentStore?.storeName ?? "소속 매장 없음";

  const handleSelectStore = (storeId: number) => {
    setCurrentStoreId(storeId); // ✅ 전역 반영
    localStorage.setItem(EMPLOYEE_STORE_LS_KEY, String(storeId)); // ✅ 새로고침 복원
    setOpen(false);
    console.log(`Selected Store ID: ${storeId}`);
  };

  const canShowDropdown = isLoggedIn && employeeId != null && stores.length > 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          if (!canShowDropdown) return;
          setOpen((prev) => !prev);
        }}
        className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted focus:outline-none transition-colors"
      >
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium shrink-0">
          {displayName.charAt(0)}
        </div>

        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium truncate">{isLoading ? "로딩 중..." : displayName}</p>
          <p className="text-xs text-muted-foreground truncate">
            {!isLoggedIn || employeeId == null ? "로그인이 필요합니다" : isLoading ? "..." : currentStoreName}
          </p>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""} ${
            canShowDropdown ? "" : "opacity-50"
          }`}
        />
      </button>

      {open && canShowDropdown && (
        <div className="absolute left-0 top-full mt-2 w-64 rounded-lg border bg-popover shadow-md z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="py-1 bg-white">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 border-b">
              사업장 전환
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {stores.map((store) => (
                <button
                  key={store.storeId}
                  type="button"
                  onClick={() => handleSelectStore(store.storeId)}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-sm text-left hover:bg-muted/50 transition-colors ${
                    store.storeId === selectedStoreId ? "bg-blue-50 text-blue-700 font-medium" : ""
                  }`}
                >
                  <span className="truncate">{store.storeName}</span>
                  {store.storeId === selectedStoreId && <Check className="h-4 w-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {open && canShowDropdown && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setOpen(false)} />}
    </div>
  );
}

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const { user, isLoggedIn, logout, isLoading, getAccessToken } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isPublicEmployeePath(pathname)) return;
    if (isLoading) return;

    const token = getAccessToken?.();
    const employeeId = (user as any)?.employeeId ?? (user as any)?.employee_id;

    const ok = isLoggedIn && user?.role === "EMPLOYEE" && !!token && Number(employeeId) > 0;
    if (!ok) router.replace("/login");
  }, [mounted, pathname, isLoading, isLoggedIn, user, router, getAccessToken]);

  if (!mounted) return null;

  if (isPublicEmployeePath(pathname)) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  if (isLoading) return null;
  {
    const token = getAccessToken?.();
    const employeeId = (user as any)?.employeeId ?? (user as any)?.employee_id;
    const ok = isLoggedIn && user?.role === "EMPLOYEE" && !!token && Number(employeeId) > 0;
    if (!ok) return null;
  }

  const filteredNavigation = EMPLOYEE_NAV_ITEMS.filter(
    (item) => item.name !== "설정" && !item.href.includes("/settings")
  );

  return (
    <StoreProvider>
      <AppLayout
        navigation={filteredNavigation}
        sidebarHeader={<EmployeeInfo />}
        logoIcon={Clock}
        logoText="직원 서비스"
        headerActions={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => logout()}
            disabled={isLoading}
            aria-label="로그아웃"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </Button>
        }
      >
        {children}
      </AppLayout>
    </StoreProvider>
  );
}