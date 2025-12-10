"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/common/AppLayout";
import { EMPLOYEE_NAV_ITEMS } from "@/lib/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { StoreProvider, useStore } from "@/contexts/StoreContext"; // ✅ StoreContext 추가
import { ChevronDown, Clock, Store as StoreIcon } from "lucide-react";

/**
 * 직원 레이아웃 전용 사용자 정보 UI
 * - 사장님 레이아웃과 동일하게 사업장 선택 드롭다운 기능 포함
 */
function EmployeeInfo() {
  const { user } = useAuth();
  const { stores, currentStoreId, setCurrentStoreId, isLoading } = useStore(); // ✅ 사업장 상태 연동
  const [open, setOpen] = useState(false);

  // 안전한 이름 처리
  const displayName =
    (user as any)?.name ??
    (user as any)?.username ??
    (user as any)?.email ??
    "직원";

  // 현재 선택된 사업장 (없으면 첫 번째)
  const currentStore =
    stores.find((s) => s.storeId === currentStoreId) ?? stores[0];

  const handleSelectStore = (id: number) => {
    setCurrentStoreId(id);
    setOpen(false);
  };

  return (
    <div className="relative">
      {/* 프로필 영역: 클릭하면 드롭다운 토글 */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted focus:outline-none"
      >
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
          {displayName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium truncate">
            {displayName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {isLoading
              ? "불러오는 중..."
              : currentStore?.storeName ?? "배정된 사업장 없음"}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* 사업장 선택 드롭다운 */}
      {open && !isLoading && stores.length > 0 && (
        <div className="absolute left-0 mt-2 w-56 rounded-lg border bg-popover shadow-md z-20">
          <div className="max-h-64 overflow-y-auto py-1 bg-white rounded-lg">
            {stores.map((store) => (
              <button
                key={store.storeId}
                type="button"
                onClick={() => handleSelectStore(store.storeId)}
                className={`block w-full px-3 py-2 text-sm text-left hover:bg-muted ${
                  store.storeId === currentStore?.storeId
                    ? "bg-muted font-semibold"
                    : ""
                }`}
              >
                {store.storeName}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    // ✅ StoreProvider로 감싸서 내부에서 useStore 사용 가능하게 함
    <StoreProvider>
      <AppLayout
        navigation={EMPLOYEE_NAV_ITEMS}
        userInfo={<EmployeeInfo />}
        logoIcon={Clock}
        logoText="직원 서비스"
      >
        {children}
      </AppLayout>
    </StoreProvider>
  );
}