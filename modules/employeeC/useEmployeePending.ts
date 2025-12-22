// modules/employeeC/useEmployeePending.ts
"use client";

import { useEffect, useState } from "react";
import { employeeApi } from "./employeeApi";
import type { PendingRequest, Banner } from "./employeeTypes";

const HISTORY_STORAGE_KEY = "erp_employee_assignment_history";

function loadHistoryFromStorage() {
  if (typeof window === "undefined") return { recentApproved: [], recentRejected: [] };
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return { recentApproved: [], recentRejected: [] };
    const parsed = JSON.parse(raw);
    return {
      recentApproved: parsed.recentApproved ?? [],
      recentRejected: parsed.recentRejected ?? [],
    };
  } catch {
    return { recentApproved: [], recentRejected: [] };
  }
}

function saveHistoryToStorage(approved: PendingRequest[], rejected: PendingRequest[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify({ recentApproved: approved, recentRejected: rejected })
    );
  } catch {}
}

export default function useEmployeePending() {
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [storeIdForPending, setStoreIdForPending] = useState<string>("11"); // 기본값 유지

  const [recentApproved, setRecentApproved] = useState<PendingRequest[]>([]);
  const [recentRejected, setRecentRejected] = useState<PendingRequest[]>([]);
  const [banner, setBanner] = useState<Banner>(null);

  const bannerShow = (b: Banner) => {
    setBanner(b);
    setTimeout(() => setBanner(null), 2400);
  };

  const fetchPending = async (storeId?: number) => {
    const target = typeof storeId === "number" ? storeId : Number(storeIdForPending);
    if (Number.isNaN(target)) {
      setPending([]);
      return;
    }
    try {
      setLoadingPending(true);
      const data = await employeeApi.fetchPendingAssignments(target);
      setPending(data || []);
    } catch (e) {
      setPending([]);
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    fetchPending();
    const saved = loadHistoryFromStorage();
    setRecentApproved(saved.recentApproved);
    setRecentRejected(saved.recentRejected);
  }, []);

  const approve = async (assignmentId: number) => {
    const target = pending.find((p) => p.assignmentId === assignmentId);
    if (!target) return;

    setPending((prev) => prev.filter((p) => p.assignmentId !== assignmentId));
    try {
      await employeeApi.approveAssignment(assignmentId);
      setRecentApproved((prev) => {
        const updated = [{ ...target, status: "APPROVED" }, ...prev].slice(0, 8);
        saveHistoryToStorage(updated, recentRejected);
        return updated;
      });
      bannerShow({ type: "success", message: "승인 완료" });
    } catch (e) {
      setPending((prev) => [target, ...prev]);
      bannerShow({ type: "error", message: "승인 실패" });
    }
  };

  const reject = async (assignmentId: number) => {
    const target = pending.find((p) => p.assignmentId === assignmentId);
    if (!target) return;

    setPending((prev) => prev.filter((p) => p.assignmentId !== assignmentId));
    try {
      await employeeApi.rejectAssignment(assignmentId);
      setRecentRejected((prev) => {
        const updated = [{ ...target, status: "REJECTED" }, ...prev].slice(0, 8);
        saveHistoryToStorage(recentApproved, updated);
        return updated;
      });
      bannerShow({ type: "success", message: "거절 완료" });
    } catch (e) {
      setPending((prev) => [target, ...prev]);
      bannerShow({ type: "error", message: "거절 실패" });
    }
  };

  return {
    pending, loadingPending, storeIdForPending, setStoreIdForPending,
    recentApproved, recentRejected, banner,
    fetchPending, approve, reject
  };
}