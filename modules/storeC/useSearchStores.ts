"use client";

import { useState } from "react";
import { storeApi, extractErrorMessage } from "./storeApi";
import type { PreviewStore, AssignmentStatus } from "./storeTypes";

const MOCK_EMPLOYEE_ID = 3;   // 로그인 전 임시 값

export function useSearchStores() {
  const [workplaceCode, setWorkplaceCode] = useState("");
  const [searchResult, setSearchResult] = useState<PreviewStore | null>(null);
  const [appliedStores, setAppliedStores] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);

  // 신청 상태: null(미조회) | "NONE" | "PENDING" | "ACCEPTED" | "REJECTED"
  const [assignmentStatus, setAssignmentStatus] = useState<AssignmentStatus | "NONE" | null>(null);

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
      setAssignmentStatus(null); 

      // ✅ [수정] getStoreById 사용 및 데이터 매핑
      const rawStore = await storeApi.getStoreById(id);
      
      const mappedStore: PreviewStore = {
        storeId: rawStore.storeId,
        storeName: rawStore.storeName,
        industry: rawStore.industry,
        distance: 0, // 기본값
        address: "-",
        description: "-",
        employeeCount: 0 // 기본값
      };
      
      setSearchResult(mappedStore);

      try {
        // ✅ [수정] MOCK_EMPLOYEE_ID 제거 (API가 알아서 처리하거나 토큰 사용 가정, or storeApi 수정 필요)
        // storeApi.fetchAssignmentStatus는 storeId만 받음
        const status = await storeApi.fetchAssignmentStatus(id);
        setAssignmentStatus(status);

        if (status === "PENDING") {
          setAppliedStores((prev) =>
            prev.includes(id) ? prev : [...prev, id],
          );
        }
      } catch {
        setAssignmentStatus(null);
      }
    } catch {
      setSearchResult(null);
      setAssignmentStatus(null);
      alert("사업장 코드를 찾을 수 없습니다.");
    } finally {
      setSearching(false);
    }
  };

  const handleApply = async (storeId: number) => {
    if (assignmentStatus === "PENDING") {
      alert("이미 신청 중인 사업장입니다. 사장님 승인 대기 중입니다.");
      return;
    }
    // ✅ [수정] APPROVED -> ACCEPTED
    if (assignmentStatus === "ACCEPTED") {
      alert("이미 승인된 사업장입니다. 출퇴근/근무 메뉴에서 확인하세요.");
      return;
    }
    if (appliedStores.includes(storeId) && assignmentStatus !== "REJECTED") {
      alert("이미 신청한 사업장입니다.");
      return;
    }

    try {
      setSubmitting(true);
      // ✅ [수정] storeApi.applyToStore(storeId) 사용 (단일 인자)
      await storeApi.applyToStore(storeId);

      setAppliedStores((prev) =>
        prev.includes(storeId) ? prev : [...prev, storeId],
      );
      setAssignmentStatus("PENDING");

      alert("신청이 접수되었습니다. 사장님 승인 대기 중입니다.");
      setWorkplaceCode("");
    } catch (e: any) {
      const msg = extractErrorMessage(e);
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    workplaceCode,
    searchResult,
    appliedStores,
    submitting,
    searching,
    assignmentStatus,
    setWorkplaceCode,
    handleSearch,
    handleApply,
  };
}