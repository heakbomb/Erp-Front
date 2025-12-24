// modules/storeC/useSearchStores.ts
"use client";

import { useState } from "react";
import { storeApi, extractErrorMessage } from "./storeApi";
import type { PreviewStore, AssignmentStatus } from "./storeTypes";
import { useSearch } from "@/shared/hooks/useSearch";

const MOCK_EMPLOYEE_ID = 3;

export function useSearchStores() {
  const [searchResult, setSearchResult] = useState<PreviewStore | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);

  const [assignmentStatus, setAssignmentStatus] =
    useState<AssignmentStatus | "NONE">("NONE");

  const performSearch = async (code: string) => {
    if (!code) {
      alert("사업장 코드를 입력하세요.");
      return;
    }
    const id = Number(code);
    if (Number.isNaN(id)) {
      alert("사업장 코드는 숫자 형태여야 합니다.");
      return;
    }

    try {
      setSearching(true);
      setSearchResult(null);
      setAssignmentStatus("NONE");

      // ✅ 승인된 사업장만 조회
      const rawStore = await storeApi.getApprovedStoreById(id);

      const mappedStore: PreviewStore = {
        storeId: rawStore.storeId,
        storeName: rawStore.storeName,
        industry: rawStore.industry,
        distance: 0,
        description: "-",
        employeeCount: 0,
        address: "-", // 기존 UI 유지
      };
      setSearchResult(mappedStore);

      const status = await storeApi.fetchAssignmentStatus(MOCK_EMPLOYEE_ID, id);
      setAssignmentStatus(status);
    } catch (e: any) {
      setSearchResult(null);
      setAssignmentStatus("NONE");
      alert(extractErrorMessage(e) || "승인된 사업장만 검색할 수 있습니다.");
    } finally {
      setSearching(false);
    }
  };

  const {
    keyword: workplaceCode,
    handleChange: handleWorkplaceCodeChange,
    submitSearch: handleSearch,
    handleKeyDown,
  } = useSearch({
    onSearch: performSearch,
  });

  const handleApply = async (storeId: number) => {
    if (assignmentStatus === "PENDING") {
      alert("이미 신청 중입니다. 사장님 승인 대기 중입니다.");
      return;
    }
    if (assignmentStatus === "ACCEPTED") {
      alert("이미 승인된 사업장입니다.");
      return;
    }

    try {
      setSubmitting(true);

      await storeApi.applyToStore({
        employeeId: MOCK_EMPLOYEE_ID,
        storeId,
        role: "STAFF",
      });

      setAssignmentStatus("PENDING");
      alert("신청이 접수되었습니다. 사장님 승인 대기 중입니다.");
    } catch (e: any) {
      alert(extractErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ GPS 조회(좌표 전용 API)
  const fetchStoreGps = async (storeId: number) => {
    return await storeApi.getStoreGps(storeId);
  };

  return {
    workplaceCode,
    searchResult,
    submitting,
    searching,
    assignmentStatus,

    setWorkplaceCode: handleWorkplaceCodeChange,
    handleSearch,
    handleKeyDown,
    handleApply,

    fetchStoreGps, // ✅ 추가
  };
}