"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { storeApi } from "./storeApi";

export function useAdminStores() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [tab, setTab] = useState("PENDING"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const queryParams = {
    page,
    size: pageSize,
    status: tab,
    q: submittedSearch,
  };

  const {
    data: storesData,
    isLoading: isStoresLoading,
    error: storesError,
  } = useQuery({
    queryKey: ["adminStores", queryParams],
    queryFn: () => storeApi.getStores(queryParams),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ storeId, status }: { storeId: number; status: "APPROVED" | "REJECTED" }) =>
      storeApi.updateStoreStatus(storeId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminStores"] });
      toast.success("사업장 상태가 변경되었습니다.");
    },
    onError: (error) => {
      console.error(error);
      toast.error(`상태 변경 실패: ${error.message}`);
    },
  });

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

  const handleTabChange = (value: string) => {
    setTab(value);
    setPage(0);
  };

  const handleSearch = () => {
    setSubmittedSearch(searchQuery);
    setPage(0);
  };
  
  const handlePageChange = (p: number) => {
    if (p >= 0 && p < (storesData?.totalPages ?? 1)) {
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