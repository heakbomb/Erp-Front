// features/employee/search-stores/hooks/useSearchStores.ts
"use client";

import { useState } from "react";
import {
  applyToStore,
  fetchStoreById,
  PreviewStore,
} from "@/features/employee/search-stores/services/searchStoresService";

const MOCK_EMPLOYEE_ID = 3;   // 로그인 전 임시 값 (네 코드 그대로)
const DEFAULT_ROLE = "STAFF";

export function useSearchStores() {
  const [workplaceCode, setWorkplaceCode] = useState("");
  const [searchResult, setSearchResult] = useState<PreviewStore | null>(null);
  const [appliedStores, setAppliedStores] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    const trimmed = workplaceCode.trim();
    if (!trimmed) {
      alert("사업장 코드를 입력하세요.");
      return;
    }
    const id = Number(trimmed);
    if (Number.isNaN(id)) {
      alert("사업장 코드는 숫자 형태여야 합니다. (예: 11)");
      return;
    }

    try {
      setSearching(true);
      const store = await fetchStoreById(id);
      setSearchResult(store);
    } catch {
      setSearchResult(null);
      alert("사업장 코드를 찾을 수 없습니다.");
    } finally {
      setSearching(false);
    }
  };

  const handleApply = async (storeId: number) => {
    if (appliedStores.includes(storeId)) {
      alert("이미 신청한 사업장입니다.");
      return;
    }
    try {
      setSubmitting(true);
      await applyToStore({
        employeeId: MOCK_EMPLOYEE_ID,
        storeId,
        role: DEFAULT_ROLE,
      });
      setAppliedStores((prev) => [...prev, storeId]);
      alert("신청이 접수되었습니다. 사장님 승인 대기 중입니다.");
      setSearchResult(null);
      setWorkplaceCode("");
    } catch (e: any) {
      const msg =
        e?.response?.data ??
        e?.message ??
        "신청 중 오류가 발생했습니다. (직원/사업장 존재 여부 또는 중복 신청 여부 확인)";
      alert(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    // 상태
    workplaceCode,
    searchResult,
    appliedStores,
    submitting,
    searching,
    // 이벤트
    setWorkplaceCode,
    handleSearch,
    handleApply,
  };
}