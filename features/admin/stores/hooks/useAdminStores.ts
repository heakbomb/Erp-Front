// features/admin/stores/hooks/useAdminStores.ts
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStores, updateStoreStatus } from "../adminStoresService";

export function useAdminStores() {
  const queryClient = useQueryClient();

  // 1. 목록 필터링 상태 (탭, 검색, 페이지)
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [tab, setTab] = useState("PENDING"); // ⭐️ 기본 탭: 승인 대기
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
      // ⭐️ 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["adminStores"] });
    },
    onError: (error) => alert(error.message),
  });

  // 5. 이벤트 핸들러: 승인/반려
  const handleApprove = (storeId: number) => {
    if (confirm(`Store ID ${storeId}를 승인하시겠습니까?`)) {
      updateStatusMutation.mutate({ storeId, status: "APPROVED" });
    }
  };

  const handleReject = (storeId: number) => {
    if (confirm(`Store ID ${storeId}를 반려하시겠습니까?`)) {
      updateStatusMutation.mutate({ storeId, status: "REJECTED" });
    }
  };

  // 6. 이벤트 핸들러: 탭, 검색, 페이지
  const handleTabChange = (value: string) => {
    setTab(value);
    setPage(0);
  };

  const handleSearch = () => {
    setSubmittedSearch(searchQuery);
    setPage(0);
  };
  
  const handlePageChange = (p: number) => {
    if (p >= 0 && p < (storesData?.totalPages ?? 0)) {
        setPage(p);
    }
  };

  return {
    storesData,
    isStoresLoading,
    storesError,
    
    page,
    totalPages: storesData?.totalPages ?? 0,
    handlePageChange,
    
    tab,
    handleTabChange,
    
    searchQuery,
    setSearchQuery,
    handleSearch,
    
    handleApprove,
    handleReject,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}