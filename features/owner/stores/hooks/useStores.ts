// features/owner/stores/hooks/useStores.ts
"use client"

import { useCallback, useEffect, useMemo, useState } from "react";
import { 
  fetchStores, 
  updateStore, 
  deleteStore,  // ✅ 1. deleteStore 임포트
  StoreType       // ✅ 2. StoreType 임포트 (Store의 별칭)
} from "../services/storesService";
// ✅ 3. Store 타입을 직접 임포트할 수도 있습니다.
// import type { Store as StoreType } from "@/lib/types/database";

export function useStores(version?: number) {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchStores();
      setStores(data);
    } catch (e) {
      console.error("사업장 목록 불러오기 실패:", e);
      throw e; 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    load().catch(console.error);
  }, [load, version]);

  const hasData = useMemo(() => stores.length > 0, [stores]);

  const hardDelete = useCallback(async (id: number) => {
    await deleteStore(id, true);
    await load();
  }, [load]);

  const softDelete = useCallback(async (id: number) => {
    await deleteStore(id, false);
    await load();
  }, [load]);

  const patch = useCallback(async (id: number, payload: Parameters<typeof updateStore>[1]) => {
    await updateStore(id, payload);
    await load();
  }, [load]);

  return { stores, loading, hasData, reload: load, hardDelete, softDelete, patch };
}