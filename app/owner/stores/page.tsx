"use client";

import StoreList from "@/modules/storeC/StoreList";

export default function StoresPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">매장 관리</h2>
        <p className="text-muted-foreground">
          운영 중인 매장을 등록하고 관리할 수 있습니다.
        </p>
      </div>
      
      {/* ✅ StoreList 내부에서:
            1. 목록 조회
            2. 매장 추가 (StoreAdd Dialog 포함)
            3. 매장 수정/삭제
            4. 사업자 인증
         기능을 모두 처리하므로 추가 Props 없이 호출하면 됩니다.
      */}
      <StoreList />
    </div>
  );
}