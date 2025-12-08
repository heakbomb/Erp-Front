// features/owner/common/OwnerStoreGuard.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/contexts/StoreContext";

type Props = {
  children: ReactNode;
};

export function OwnerStoreGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // ✅ 선택된 사업장 정보는 여기에서 가져옴
  const { stores, currentStoreId } = useStore();

  // ✅ 현재 선택된 사업장 객체
  const currentStore =
    stores.find((s) => s.storeId === currentStoreId) ?? undefined;

  useEffect(() => {
    // 아직 사업장 목록이 안 불려왔거나, 선택된 사업장이 없으면 패스
    if (!currentStore) return;

    // owner 영역이 아닐 때는 신경 안 씀
    if (!pathname.startsWith("/owner")) return;

    // 사업장 관리 화면(/owner/stores)은 예외로 허용 (여기서 다시 활성화할 수 있어야 하니까)
    if (pathname.startsWith("/owner/stores")) return;

    // ✅ 비활성화 상태면 바로 막고, 사업장 관리 화면으로 보냄
    if (currentStore.status === "INACTIVE") {
      alert("비활성화된 사업장입니다.\n사업장을 활성화한 후 기능을 이용해주세요.");
      router.push("/owner/stores");
    }
  }, [currentStore, pathname, router]);

  return <>{children}</>;
}