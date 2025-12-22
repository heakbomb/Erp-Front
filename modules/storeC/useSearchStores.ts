// modules/storeC/useSearchStores.ts
"use client";

import { useState } from "react";
import { storeApi, extractErrorMessage } from "./storeApi";
import type { PreviewStore, AssignmentStatus } from "./storeTypes";
import { useSearch } from "@/shared/hooks/useSearch"; // 공용 훅 import

const MOCK_EMPLOYEE_ID = 3; 

export function useSearchStores() {
  const [searchResult, setSearchResult] = useState<PreviewStore | null>(null);
  const [appliedStores, setAppliedStores] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [assignmentStatus, setAssignmentStatus] = useState<AssignmentStatus | "NONE" | null>(null);

  // 1. 실제 검색 로직 (useSearch의 onSearch 콜백으로 전달됨)
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
      setAssignmentStatus(null); 

      // 사업장 조회
      const rawStore = await storeApi.getStoreById(id);
      
      const mappedStore: PreviewStore = {
        storeId: rawStore.storeId,
        storeName: rawStore.storeName,
        industry: rawStore.industry,
        distance: 0, 
        address: "-", 
        description: "-", 
        employeeCount: 0
      };
      setSearchResult(mappedStore);

      // 신청 상태 조회
      try {
        const status = await storeApi.fetchAssignmentStatus(MOCK_EMPLOYEE_ID, id);
        setAssignmentStatus(status);
        if (status === "PENDING") {
          setAppliedStores((prev) => prev.includes(id) ? prev : [...prev, id]);
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

  // 2. useSearch 훅 사용
  // keyword -> workplaceCode로 매핑
  // handleChange -> setWorkplaceCode로 매핑 (Input의 onChange와 호환되도록 이벤트 핸들러 사용)
  const { 
    keyword: workplaceCode,
    handleChange: handleWorkplaceCodeChange,
    submitSearch: handleSearch,
    handleKeyDown 
  } = useSearch({
    onSearch: performSearch, // 엔터/검색버튼 클릭 시 실행될 함수
  });

  const handleApply = async (storeId: number) => {
    if (assignmentStatus === "PENDING") {
      alert("이미 신청 중인 사업장입니다. 사장님 승인 대기 중입니다.");
      return;
    }
    
    if (assignmentStatus === "ACCEPTED") {
      alert("이미 승인된 사업장입니다.");
      return;
    }

    if (appliedStores.includes(storeId) && assignmentStatus !== "REJECTED") {
      alert("이미 신청한 사업장입니다.");
      return;
    }

    try {
      setSubmitting(true);
      await storeApi.applyToStore({
        employeeId: MOCK_EMPLOYEE_ID,
        storeId,
        role: "STAFF"
      });

      setAppliedStores((prev) =>
        prev.includes(storeId) ? prev : [...prev, storeId],
      );
      setAssignmentStatus("PENDING");

      alert("신청이 접수되었습니다. 사장님 승인 대기 중입니다.");
      // 검색어 초기화가 필요하다면 아래처럼 처리 가능하지만, 
      // handleWorkplaceCodeChange는 이벤트 객체를 받으므로 직접 setKeyword를 노출하거나 해야 함.
      // 여기서는 검색어 유지를 기본으로 함.
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
    
    // ✅ View의 onChange={setWorkplaceCode}와 호환되도록 이벤트 핸들러 전달
    setWorkplaceCode: handleWorkplaceCodeChange, 
    
    // ✅ View의 onClick={handleSearch}와 호환
    handleSearch, 
    
    // ✅ View의 onKeyDown={handleKeyDown}와 호환 (엔터키 검색)
    handleKeyDown,
    
    handleApply,
  };
}