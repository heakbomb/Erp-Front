// app/employee/layout.tsx
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AppLayout } from "@/shared/layout/AppLayout";
import { EMPLOYEE_NAV_ITEMS } from "@/shared/utils/navigation";
import { StoreProvider } from "@/contexts/StoreContext";
import { ChevronDown, Clock, Check } from "lucide-react";

// ✅ [수정됨] import 경로 변경 (features -> modules)
import { useEmployeeProfile, useEmployeeStores } from "@/modules/employeeC/useEmployeeProfile";

/**
 * 직원 레이아웃 전용 사용자 정보 UI
 * - 3번 직원을 고정으로 사용하여 프로필과 소속 사업장 목록을 드롭다운으로 보여줍니다.
 */
function EmployeeInfo() {
  const TARGET_EMPLOYEE_ID = 3;
  
  // 1. 직원 정보 및 사업장 목록 조회
  const { profile, isLoading: isProfileLoading } = useEmployeeProfile(TARGET_EMPLOYEE_ID);
  const { stores, isLoading: isStoresLoading } = useEmployeeStores(TARGET_EMPLOYEE_ID);

  // 2. UI 상태 관리
  const [open, setOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  // 로딩 완료 후 첫 번째 사업장 자동 선택
  useEffect(() => {
    if (stores.length > 0 && selectedStoreId === null) {
      setSelectedStoreId(stores[0].storeId);
    }
  }, [stores, selectedStoreId]);

  const isLoading = isProfileLoading || isStoresLoading;
  const displayName = profile?.name ?? "직원";
  
  // 현재 선택된 사업장 객체 찾기
  const currentStore = stores.find((s) => s.storeId === selectedStoreId) ?? stores[0];
  const currentStoreName = currentStore?.storeName ?? "소속 매장 없음";

  const handleSelectStore = (storeId: number) => {
    setSelectedStoreId(storeId);
    setOpen(false);
    // 추후 전역 상태(StoreContext)나 쿠키에 저장하는 로직 추가 가능
    console.log(`Selected Store ID: ${storeId}`);
  };

  return (
    <div className="relative">
      {/* 프로필 영역: 클릭하면 드롭다운 토글 */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted focus:outline-none transition-colors"
      >
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium shrink-0">
          {displayName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium truncate">
            {isLoading ? "로딩 중..." : displayName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {isLoading ? "..." : currentStoreName}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* 사업장 선택 드롭다운 (사장님 레이아웃과 유사한 스타일) */}
      {open && stores.length > 0 && (
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
                  {store.storeId === selectedStoreId && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* 닫힘 배경 클릭 처리 (Optional UX) */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => setOpen(false)} 
        />
      )}
    </div>
  );
}

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (pathname === "/employee/attendance/mobile") {
    return <div className="min-h-screen bg-background">{children}</div>;
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
      >
        {children}
      </AppLayout>
    </StoreProvider>
  );
}