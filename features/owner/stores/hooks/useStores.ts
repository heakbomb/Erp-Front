// features/owner/stores/hooks/useStores.ts
"use client"

import { useCallback, useEffect, useMemo, useState } from "react";
import { 
  fetchStores, 
  updateStore, 
  deleteStore,
  activateStore, // ✅ 활성화 API
  StoreType
} from "../services/storesService";

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

  const reactivate = useCallback(async (id: number) => {
    await activateStore(id);
    await load();
  }, [load]);

  const patch = useCallback(
    async (id: number, payload: Parameters<typeof updateStore>[1]) => {
      await updateStore(id, payload);
      await load();
    },
    [load]
  );

  // ✅ reactivate 추가
  return { stores, loading, hasData, reload: load, hardDelete, softDelete, reactivate, patch };
}