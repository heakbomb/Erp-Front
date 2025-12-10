// app/owner/layout.tsx
"use client";

import React from "react";
import { AppLayout } from "@/components/common/AppLayout";
import { ownerNavigation } from "@/lib/navigation";
import { StoreProvider, useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";

import { Store as StoreIcon, ChevronDown, MessageCircleQuestion } from "lucide-react";
import { OwnerStoreGuard } from "@/features/owner/common/OwnerStoreGuard";

/**
 * 사장님 레이아웃 전용 사용자 / 사업장 정보 UI
 */
function OwnerInfo() {
  const { user } = useAuth();
  const { stores, currentStoreId, setCurrentStoreId, isLoading } = useStore();
  const [open, setOpen] = React.useState(false);

  const displayName =
    (user as any)?.name ??
    (user as any)?.username ??
    (user as any)?.email ??
    "홍길동";

  // ✅ 현재 선택된 사업장 (fallback 제거)
  const currentStore =
    currentStoreId != null
      ? stores.find((s) => s.storeId === currentStoreId) ?? null
      : null;

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
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-medium">
            {displayName.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium truncate">
            {displayName} 사장님
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {isLoading
              ? "사업장 불러오는 중..."
              : currentStore
              ? currentStore.storeName
              : stores.length > 0
              ? "사업장을 선택해 주세요"
              : "등록된 사업장이 없습니다"}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* 사업장 선택 드롭다운 */}
      {open && !isLoading && stores.length > 0 && (
        <div className="absolute left-0 mt-2 w-56 rounded-lg border bg-popover shadow-md z-20">
          <div className="max-h-64 overflow-y-auto py-1">
            {stores.map((store) => (
              <button
                key={store.storeId}
                type="button"
                onClick={() => handleSelectStore(store.storeId)}
                className={`block w-full px-3 py-2 text-sm text-left hover:bg-muted ${
                  store.storeId === currentStoreId ? "bg-muted font-semibold" : ""
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

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigationWithInquiry = [
    ...ownerNavigation,
    { name: "1:1 문의", href: "/owner/inquiries", icon: MessageCircleQuestion },
  ];

  return (
    <StoreProvider>
      <OwnerStoreGuard>
        <AppLayout
          navigation={navigationWithInquiry}
          userInfo={<OwnerInfo />}
          logoIcon={StoreIcon}
          logoText="요식업 ERP"
        >
          {children}
        </AppLayout>
      </OwnerStoreGuard>
    </StoreProvider>
  );
}