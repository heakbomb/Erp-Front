"use client"

import { useCallback, useEffect, useMemo, useState } from "react";
import { storeApi } from "./storeApi";
import type { StoreResponse, StoreCreateRequest } from "./storeTypes";
import { useAuth } from "@/contexts/AuthContext"; // ✅ 추가

export function useStores(version?: number) {
  const { user } = useAuth(); // ✅ 추가
  const ownerId = (user as any)?.ownerId; // ✅ 핵심: 로그인 응답/스토리지에 저장된 ownerId 사용

  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    // ✅ ownerId 없으면 호출 자체를 안 함 (undefined 요청 방지)
    if (!ownerId) {
      setStores([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await storeApi.fetchMyStores(ownerId); // ✅ 변경: 인자 필수
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

  const patch = useCallback(
    async (id: number, payload: StoreCreateRequest) => {
      try {
        await storeApi.updateStore(id, payload);
        await load();
      } catch (e: any) {
        console.error(e);
        setError(e?.friendlyMessage || e?.message || "수정 실패");
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