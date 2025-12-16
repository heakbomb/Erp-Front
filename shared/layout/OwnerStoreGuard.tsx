"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/contexts/StoreContext";
import { Skeleton } from "@/shared/ui/skeleton";

interface OwnerStoreGuardProps {
  children: React.ReactNode;
}

export function OwnerStoreGuard({ children }: OwnerStoreGuardProps) {
  const router = useRouter();
  const { stores, isLoading, currentStoreId, setCurrentStoreId } = useStore();

  useEffect(() => {
    if (isLoading) return;

    if (stores.length === 0) {
      if (window.location.pathname !== "/owner/stores") {
        router.replace("/owner/stores");
      }
      return;
    }

    if (currentStoreId === null && stores.length > 0) {
      setCurrentStoreId(stores[0].storeId);
    }
  }, [isLoading, stores, currentStoreId, router, setCurrentStoreId]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-8">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (stores.length === 0 && typeof window !== 'undefined' && window.location.pathname !== "/owner/stores") {
    return null;
  }

  return <>{children}</>;
}