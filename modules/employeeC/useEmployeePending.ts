"use client";

import { useEffect, useState, useCallback } from "react";
import { employeeApi } from "./employeeApi";
import type { PendingRequest, Banner } from "./employeeTypes";
import { useStore } from "@/contexts/StoreContext"; // ✅ 추가

export default function useEmployeePending() {
  const { currentStoreId } = useStore(); // ✅ 선택된 사업장 ID

  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  const bannerShow = useCallback((b: Banner) => {
    setBanner(b);
    setTimeout(() => setBanner(null), 2400);
  }, []);

  // ✅ currentStoreId 기반으로만 조회 (입력/하드코딩 제거)
  const fetchPending = useCallback(async () => {
    if (!currentStoreId) {
      setPending([]);
      return;
    }

    try {
      setLoadingPending(true);
      const data = await employeeApi.fetchPendingAssignments(currentStoreId);
      setPending(data || []);
    } catch {
      setPending([]);
    } finally {
      setLoadingPending(false);
    }
  }, [currentStoreId]);

  // ✅ 사업장 변경/초기 진입 시 자동 조회
  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const approve = useCallback(
    async (assignmentId: number) => {
      const target = pending.find((p) => p.assignmentId === assignmentId);
      if (!target) return;

      // 낙관적 업데이트
      setPending((prev) => prev.filter((p) => p.assignmentId !== assignmentId));

      try {
        await employeeApi.approveAssignment(assignmentId);
        bannerShow({ type: "success", message: "승인 완료" });
      } catch {
        // 실패 시 복구
        setPending((prev) => [target, ...prev]);
        bannerShow({ type: "error", message: "승인 실패" });
      }
    },
    [pending, bannerShow]
  );

  const reject = useCallback(
    async (assignmentId: number) => {
      const target = pending.find((p) => p.assignmentId === assignmentId);
      if (!target) return;

      setPending((prev) => prev.filter((p) => p.assignmentId !== assignmentId));

      try {
        await employeeApi.rejectAssignment(assignmentId);
        bannerShow({ type: "success", message: "거절 완료" });
      } catch {
        setPending((prev) => [target, ...prev]);
        bannerShow({ type: "error", message: "거절 실패" });
      }
    },
    [pending, bannerShow]
  );

  return {
    pending,
    loadingPending,
    banner,
    fetchPending,
    approve,
    reject,
  };
}