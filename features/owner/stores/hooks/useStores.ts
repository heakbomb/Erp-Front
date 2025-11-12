import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteStore, fetchStores, StoreType, updateStore } from "../services/storesService";

export function useStores(version?: number) {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchStores();
      setStores(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, version]);

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