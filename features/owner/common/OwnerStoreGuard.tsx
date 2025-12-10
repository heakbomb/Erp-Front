// features/owner/common/OwnerStoreGuard.tsx
"use client";

import { ReactNode, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/contexts/StoreContext";

type Props = {
  children: ReactNode;
};

export function OwnerStoreGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { stores, currentStoreId } = useStore();

  const currentStore =
    stores.find((s) => s.storeId === currentStoreId) ?? undefined;

  // 🚫 중복 Push 방지를 위한 플래그
  const isRedirecting = useRef(false);

  useEffect(() => {
    if (!currentStore) return;
    if (!pathname.startsWith("/owner")) return;

    // 사업장 관리 화면은 예외
    if (pathname.startsWith("/owner/stores")) return;

    // 🚨 물리적으로 비활성화된 사업장
    if (currentStore.status === "INACTIVE" || currentStore.active === false) {
      if (!isRedirecting.current) {
        isRedirecting.current = true;
        // ⚠️ alert 제거 (전역 인터셉터에서만 alert)
        router.push("/owner/stores");
      }
    }
  }, [currentStore, pathname, router]);

  return <>{children}</>;
}