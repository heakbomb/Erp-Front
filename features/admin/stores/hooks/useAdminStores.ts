// features/admin/stores/hooks/useAdminStores.ts
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // 또는 사용 중인 Toast 라이브러리
import { getStores, updateStoreStatus } from "../adminStoresService";

export function useAdminStores() {
  const queryClient = useQueryClient();

  // 1. 목록 필터링 상태 (탭, 검색, 페이지)
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [tab, setTab] = useState("PENDING"); // 기본 탭: 승인 대기
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  // 2. API 요청 파라미터
  const queryParams = {
    page,
    size: pageSize,
    status: tab,
    q: submittedSearch,
  };

  // 3. (Query) 사업장 목록 조회
  const {
    data: storesData,
    isLoading: isStoresLoading,
    error: storesError,
  } = useQuery({
    queryKey: ["adminStores", queryParams],
    queryFn: () => getStores(queryParams),
  });

  // 4. (Mutation) 사업장 상태 변경
  const updateStatusMutation = useMutation({
    mutationFn: ({ storeId, status }: { storeId: number; status: "APPROVED" | "REJECTED" }) =>
      updateStoreStatus(storeId, { status }),
    onSuccess: () => {
      // ⭐️ 목록 갱신 (승인 일시 등이 즉시 반영됨)
      queryClient.invalidateQueries({ queryKey: ["adminStores"] });
      // ⭐️ 상세 보기 쿼리도 갱신 (선택 사항)
      queryClient.invalidateQueries({ queryKey: ["adminStoreDetail"] });
      toast.success("사업장 상태가 변경되었습니다.");
    },
    onError: (error) => {
      console.error(error);
      toast.error(`상태 변경 실패: ${error.message}`);
    },
  });

  // 5. 이벤트 핸들러: 승인/반려
  const handleApprove = (storeId: number) => {
    if (confirm("해당 사업장을 승인(운영중) 처리하시겠습니까?")) {
      updateStatusMutation.mutate({ storeId, status: "APPROVED" });
    }
  };

  const handleReject = (storeId: number) => {
    if (confirm("해당 사업장을 반려(영업중지) 처리하시겠습니까?")) {
      updateStatusMutation.mutate({ storeId, status: "REJECTED" });
    }
  };

  // 6. 이벤트 핸들러: 탭, 검색, 페이지
  const handleTabChange = (value: string) => {
    setTab(value);
    setPage(0); // 탭 변경 시 1페이지로 초기화
  };

  const handleSearch = () => {
    setSubmittedSearch(searchQuery);
    setPage(0); // 검색 시 1페이지로 초기화
  };
  
  const handlePageChange = (p: number) => {
    // 페이지 범위 체크
    if (p >= 0 && p < (storesData?.totalPages ?? 1)) {
        setPage(p);
    }
  };

  return {
    // Data
    storesData,
    isStoresLoading,
    storesError,
    
    // Pagination
    page,
    totalPages: storesData?.totalPages ?? 0,
    handlePageChange,
    
    // Filter
    tab,
    handleTabChange,
    searchQuery,
    setSearchQuery,
    handleSearch,
    
    // Actions
    handleApprove,
    handleReject,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}