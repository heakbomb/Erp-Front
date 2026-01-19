"use client";

import React from "react";
import { AppLayout } from "@/shared/layout/AppLayout";
import { OWNER_NAV_ITEMS } from "@/shared/utils/navigation";
import { StoreProvider, useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";

import { Store as StoreIcon, ChevronDown } from "lucide-react";
import { OwnerStoreGuard } from "@/shared/layout/OwnerStoreGuard";
import { usePathname, useRouter } from "next/navigation";

function OwnerInfo() {
  const { user } = useAuth();
  const { stores, currentStoreId, setCurrentStoreId, isLoading } = useStore();
  const [open, setOpen] = React.useState(false);

  const displayName =
    (user as any)?.name ??
    (user as any)?.username ??
    (user as any)?.email ??
    "홍길동";

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
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted focus:outline-none"
      >
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-medium">{displayName.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium truncate">{displayName} 사장님</p>
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

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // ✅ AuthContext logout 사용 (로컬스토리지 토큰 삭제 + /login 이동)
  const { logout } = useAuth();

  // ✅ URL 직접 접근 차단 (토큰 없으면 /login)
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [router, pathname]);

  return (
    <StoreProvider>
      <OwnerStoreGuard>
        <AppLayout
          navigation={OWNER_NAV_ITEMS}
          sidebarHeader={<OwnerInfo />}
          logoIcon={StoreIcon}
          logoText="요식업 ERP"
          // ✅ 여기만 추가하면 우상단에 로그아웃 버튼 1개가 생김(OwnerLayout에서만)
          enableLogout
          onLogout={logout}
          logoutLabel="로그아웃"
        >
          {children}
        </AppLayout>
      </OwnerStoreGuard>
    </StoreProvider>
  );
}