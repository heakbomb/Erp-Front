"use client"

import { useCallback, useEffect, useMemo, useState } from "react";
import { storeApi } from "./storeApi";
import type { StoreResponse, StoreCreateRequest } from "./storeTypes";
import { useAuth } from "@/contexts/AuthContext"; // ✅ 실제 경로로 통일

export function useStores(version?: number) {
  const { user } = useAuth();

  // ✅ ownerId를 number로 정규화 (string 들어와도 안전)
  const ownerId = useMemo(() => {
    const raw = (user as any)?.ownerId;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [user]);

  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!ownerId) {
      setStores([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await storeApi.fetchMyStores(ownerId);
      setStores(data);
    } catch (e: any) {
      console.error("사업장 목록 불러오기 실패:", e);
      setError(e?.friendlyMessage || e?.message || "목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

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
      setError(e?.friendlyMessage || e?.message || "삭제 실패");
    }
  }, [load]);

  const softDelete = useCallback(async (id: number) => {
    try {
      await storeApi.deleteStore(id, false);
      await load();
    } catch (e: any) {
      console.error(e);
      setError(e?.friendlyMessage || e?.message || "비활성화 실패");
      throw e;
    }
  }, [load]);

  const reactivate = useCallback(async (id: number) => {
    try {
      await storeApi.activateStore(id);
      await load();
    } catch (e: any) {
      console.error(e);
      setError(e?.friendlyMessage || e?.message || "활성화 실패");
      throw e;
    }
  }, [load]);

  const patch = useCallback(async (id: number, payload: StoreCreateRequest) => {
    try {
      await storeApi.updateStore(id, payload);
      await load();
    } catch (e: any) {
      console.error(e);
      setError(e?.friendlyMessage || e?.message || "수정 실패");
      throw e;
    }
  }, [load]);

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