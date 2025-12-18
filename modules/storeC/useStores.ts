// modules/storeC/useStores.ts
"use client"

import { useCallback, useEffect, useMemo, useState } from "react";
import { storeApi } from "./storeApi";
import type { StoreResponse, StoreCreateRequest } from "./storeTypes";

export function useStores(version?: number) {
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // storeApi.fetchMyStores는 기본값(ownerId=1)을 가지고 있으므로 인자 없이 호출 가능
      const data = await storeApi.fetchMyStores();
      setStores(data);
    } catch (e: any) {
      console.error("사업장 목록 불러오기 실패:", e);
      setError(e.message || "목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    load().catch(console.error);
  }, [load, version]);

  const hasData = useMemo(() => stores.length > 0, [stores]);

  const hardDelete = useCallback(async (id: number) => {
    try {
      await storeApi.deleteStore(id, true);
      await load();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "삭제 실패");
    }
  }, [load]);

  const softDelete = useCallback(async (id: number) => {
    try {
      await storeApi.deleteStore(id, false);
      await load();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "비활성화 실패");
      throw e; // 컴포넌트에서 에러 처리할 수 있도록 throw
    }
  }, [load]);

  const reactivate = useCallback(async (id: number) => {
    try {
      await storeApi.activateStore(id);
      await load();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "활성화 실패");
      throw e;
    }
  }, [load]);

  const patch = useCallback(
    async (id: number, payload: StoreCreateRequest) => {
      try {
        await storeApi.updateStore(id, payload);
        await load();
      } catch (e: any) {
        console.error(e);
        setError(e.message || "수정 실패");
        throw e;
      }
    },
    [load]
  );

  return { 
    stores, 
    loading, 
    error, 
    hasData, 
    reload: load, 
    hardDelete, 
    softDelete, 
    reactivate, 
    patch 
  };
}