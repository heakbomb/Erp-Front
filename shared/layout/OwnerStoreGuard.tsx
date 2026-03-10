"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/contexts/StoreContext";
import { Skeleton } from "@/shared/ui/skeleton";
import { Button } from "@/shared/ui/button";
import { AlertCircle, Store as StoreIcon } from "lucide-react";

interface OwnerStoreGuardProps {
  children: React.ReactNode;
}

export function OwnerStoreGuard({ children }: OwnerStoreGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { stores, isLoading, currentStoreId, setCurrentStoreId } = useStore();

  // ✅ 경로 정규화 (끝의 슬래시 제거) 하여 비교를 정확하게 만듦
  const normalizedPath = pathname.endsWith("/") && pathname !== "/" 
    ? pathname.slice(0, -1) 
    : pathname;
    
  const isStoreManagementPage = normalizedPath === "/owner/stores";
  const currentStore = stores.find((s) => s.storeId === currentStoreId);

  useEffect(() => {
    if (isLoading) return;

    // 1. 매장이 하나도 없는 경우
    if (stores.length === 0) {
      if (!isStoreManagementPage) {
        router.replace("/owner/stores");
      }
      return;
    }

    // 2. 매장은 있는데 선택된 매장이 없는 경우 (첫 번째 매장으로 자동 선택)
    if (currentStoreId === null && stores.length > 0) {
      setCurrentStoreId(stores[0].storeId);
    }
  }, [isLoading, stores, currentStoreId, router, setCurrentStoreId, isStoreManagementPage]);

  // 로딩 중 UI
  if (isLoading) {
    return (
      <div className="space-y-4 p-8">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  // ✅ 매장이 0개일 때 화면 차단 해제 (매장 관리 페이지인 경우 렌더링 허용)
  if (stores.length === 0) {
    return isStoreManagementPage ? <>{children}</> : null;
  }

  // 승인되지 않았거나 비활성화된 매장 처리
  const isNotApproved = currentStore && currentStore.status !== "APPROVED";
  const isInactive = currentStore && !currentStore.active;

  if (currentStore && (isNotApproved || isInactive) && !isStoreManagementPage) {
    let statusLabel = "";
    let guideMessage = "";

    if (isInactive) {
      statusLabel = "운영 중지 (비활성화)";
      guideMessage = "현재 사업장이 비활성화 상태여서 서비스를 이용할 수 없습니다.\n[사업장 관리]에서 활성 상태로 변경해주세요.";
    } else {
      statusLabel = currentStore.status === "PENDING" ? "승인 대기 중" : 
                    currentStore.status === "REJECTED" ? "승인 거절됨" : currentStore.status;
      guideMessage = "승인이 완료된 후 급여, 재고 관리 등 모든 기능을 이용하실 수 있습니다.";
    }

    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-6 text-center px-4">
        <div className="bg-orange-100 p-4 rounded-full">
          <AlertCircle className="h-12 w-12 text-orange-600" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">서비스 이용이 제한되었습니다</h2>
          <p className="text-muted-foreground max-w-md whitespace-pre-line">
            현재 선택된 <strong>{currentStore.storeName}</strong> 사업장은 <br />
            <span className="font-semibold text-foreground">{statusLabel}</span> 상태입니다.
          </p>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{guideMessage}</p>
        </div>

        <div className="flex gap-4">
          <Button onClick={() => router.push("/owner/stores")} variant="default">
            <StoreIcon className="mr-2 h-4 w-4" />
            사업장 관리 / 변경
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}