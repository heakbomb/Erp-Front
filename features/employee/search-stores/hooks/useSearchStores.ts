"use client";

import { useState } from "react";
import {
  applyToStore,
  fetchStoreById,
  fetchAssignmentStatus,
  type PreviewStore,
  type AssignmentStatus,
} from "@/features/employee/search-stores/services/searchStoresService";

const MOCK_EMPLOYEE_ID = 3;   // 로그인 전 임시 값 (네 코드 그대로)
const DEFAULT_ROLE = "STAFF";

export function useSearchStores() {
  const [workplaceCode, setWorkplaceCode] = useState("");
  const [searchResult, setSearchResult] = useState<PreviewStore | null>(null);
  const [appliedStores, setAppliedStores] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);

  // ✅ 신규: 현재 검색 중인 사업장에 대한 신청 상태
  //   - null  : 아직 조회 안 함
  //   - "NONE": 신청 이력 없음
  const [assignmentStatus, setAssignmentStatus] =
    useState<AssignmentStatus | "NONE" | null>(null);

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
      setAssignmentStatus(null); // 상태 초기화

      const store = await fetchStoreById(id);
      setSearchResult(store);

      // ✅ 검색 성공 시, 신청 상태도 같이 조회
      try {
        const status = await fetchAssignmentStatus(MOCK_EMPLOYEE_ID, id);
        setAssignmentStatus(status);

        // PENDING 상태면 "신청한 사업장" 목록에도 자동 반영
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
    // ✅ 상태 기반 방어 로직
    if (assignmentStatus === "PENDING") {
      alert("이미 신청 중인 사업장입니다. 사장님 승인 대기 중입니다.");
      return;
    }
    if (assignmentStatus === "APPROVED") {
      alert("이미 승인된 사업장입니다. 출퇴근/근무 메뉴에서 확인하세요.");
      return;
    }

    // 혹시라도 배열에 남아있는 경우 방어
    if (appliedStores.includes(storeId) && assignmentStatus !== "REJECTED") {
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

      // ✅ 신청 성공 → 상태 PENDING + 목록 반영
      setAppliedStores((prev) =>
        prev.includes(storeId) ? prev : [...prev, storeId],
      );
      setAssignmentStatus("PENDING");

      alert("신청이 접수되었습니다. 사장님 승인 대기 중입니다.");
      // 검색 결과 카드는 유지해서 "승인 대기" UI를 보여줌
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
    assignmentStatus,
    // 이벤트
    setWorkplaceCode,
    handleSearch,
    handleApply,
  };
}