"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  SubscriptionRequest,
  getSubscriptionStatus, // ✅ '현황' API 임포트
} from "../adminSubscriptionsService";

// 탭 상태 정의 (PRODUCTS | STATUS)
export type SubscriptionTab = "PRODUCTS" | "STATUS";

export function useAdminSubscriptions() {
  const queryClient = useQueryClient();

  // 1. 목록 필터링 상태 (기본 탭 'PRODUCTS')
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [tab, setTab] = useState<SubscriptionTab>("PRODUCTS");
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  // 2. API 요청 파라미터
  const queryParams = {
    page,
    size: pageSize,
    q: submittedSearch,
    status: tab, // (상품 조회 시 status: "PRODUCTS"는 무시됨, 백엔드에서 "ALL"로 처리)
  };

  // 3. (Query) 구독 '상품' 목록 조회
  const productsQuery = useQuery({
    queryKey: ["adminSubscriptions", "products", queryParams],
    queryFn: () => getSubscriptions(queryParams),
    enabled: tab === "PRODUCTS", // '상품' 탭일 때만 실행
  });

  // 4. (Query) 구독 '현황' 목록 조회
  const statusQuery = useQuery({
    queryKey: ["adminSubscriptionStatus", queryParams],
    queryFn: () => getSubscriptionStatus(queryParams),
    enabled: tab === "STATUS", // '현황' 탭일 때만 실행
  });

  // 5. (Mutation) 상품 생성/수정/삭제 (기존과 동일)
  const createMutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminSubscriptions", "products"] }),
    onError: (error) => alert(`생성 실패: ${error.message}`),
  });
  const updateMutation = useMutation({
    mutationFn: updateSubscription,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminSubscriptions", "products"] }),
    onError: (error) => alert(`수정 실패: ${error.message}`),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteSubscription,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminSubscriptions", "products"] }),
    onError: (error) => alert(`삭제 실패: ${error.message}`),
  });

  // 6. 이벤트 핸들러: CRUD
  const handleCreate = (data: SubscriptionRequest) => createMutation.mutate(data);
  const handleUpdate = (id: number, data: SubscriptionRequest) => updateMutation.mutate({ id, data });
  const handleDelete = (id: number) => {
    if (confirm(`구독 상품(ID ${id})을 삭제하시겠습니까?`)) {
      deleteMutation.mutate(id);
    }
  };

  // 7. 이벤트 핸들러: 탭, 검색, 페이지
  const handleTabChange = (value: string) => {
    setTab(value as SubscriptionTab);
    setPage(0);
  };
  const handleSearch = () => {
    setSubmittedSearch(searchQuery);
    setPage(0);
  };
  const handlePageChange = (p: number) => {
    const activeQuery = tab === "PRODUCTS" ? productsQuery : statusQuery;
    const totalPages = activeQuery.data?.totalPages ?? 0;
    if (p >= 0 && p < totalPages) {
      setPage(p);
    }
  };

  return {
    // 공통 상태
    tab,
    handleTabChange,
    searchQuery,
    setSearchQuery,
    handleSearch,
    page,
    handlePageChange,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,

    // 상품 탭 데이터
    productsQuery,
    handleCreate,
    handleUpdate,
    handleDelete,

    // 현황 탭 데이터
    statusQuery,
  };
}