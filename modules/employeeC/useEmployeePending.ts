"use client";

import { useEffect, useState, useCallback } from "react";
import { employeeApi } from "./employeeApi";
import type { PendingRequest, Banner } from "./employeeTypes";

export default function useEmployeePending() {
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [storeIdForPending, setStoreIdForPending] = useState<string>("101"); // 기본값 유지
  const [banner, setBanner] = useState<Banner>(null);

  const bannerShow = useCallback((b: Banner) => {
    setBanner(b);
    setTimeout(() => setBanner(null), 2400);
  }, []);

  const fetchPending = useCallback(
    async (storeId?: number) => {
      const target = typeof storeId === "number" ? storeId : Number(storeIdForPending);
      if (Number.isNaN(target)) {
        setPending([]);
        return;
      }

      try {
        setLoadingPending(true);
        const data = await employeeApi.fetchPendingAssignments(target);
        setPending(data || []);
      } catch {
        setPending([]);
      } finally {
        setLoadingPending(false);
      }
    },
    [storeIdForPending]
  );

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
    storeIdForPending,
    setStoreIdForPending,
    banner,
    fetchPending,
    approve,
    reject,
  };
}