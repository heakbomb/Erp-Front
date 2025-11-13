"use client";

import React from "react"; // 👈 "import type"이 아닌 React를 임포트
import { AppLayout } from "@/components/common/AppLayout";
import { ownerNavigation } from "@/lib/navigation";
import { StoreProvider } from "@/contexts/StoreContext"; // 👈 1. StoreProvider 임포트
import { useAuth } from "@/contexts/AuthContext"; // 👈 Auth 컨텍스트
import { Store, ChevronDown } from "lucide-react"; //

/**
 * 사장님 레이아웃 전용 사용자 정보 UI
 */
function OwnerInfo() {
  // const { user } = useAuth(); // TODO: 추후 AuthContext에서 실제 유저 정보 사용
  // const { currentStoreId, stores } = useStore(); // TODO: 추후 StoreContext에서 가게 목록 사용
  
  // 임시 하드코딩된 유저 정보
  const user = { name: "홍길동" };
  const currentStore = { name: "홍길동 식당" };

  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-sm font-medium">{user.name.charAt(0)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.name} 사장님</p>
        <p className="text-xs text-muted-foreground truncate">{currentStore.name}</p>
      </div>
      <ChevronDown className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    // 👈 2. StoreProvider로 AppLayout 감싸기
    <StoreProvider>
      <AppLayout
        navigation={ownerNavigation}
        userInfo={<OwnerInfo />}
        logoIcon={Store}
        logoText="요식업 ERP"
      >
        {children}
      </AppLayout>
    </StoreProvider>
  );
}