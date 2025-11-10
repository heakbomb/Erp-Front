// features/inventory/hooks/useInventory.ts
"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../../contexts/StoreContext"; // ⭐️ 경로 수정
import {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
} from "../inventoryService"; // ⭐️ 경로 수정
import type { Inventory } from "../../../lib/types/database"; // ⭐️ 경로 수정

// ⭐️ react-hook-form에서 사용할 폼 타입 정의
export type InventoryFormValues = {
  itemName: string;
  itemType: string;
  stockType: string;
  stockQty: number | "";
  safetyQty: number | "";
};

// ⭐️ InventoryPage.tsx에 있던 모든 로직을 이 훅으로 이동
export function useInventory() {
  const { currentStoreId } = useStore();
  const queryClient = useQueryClient();

  // ⭐️ 1. 페이지네이션/검색 상태 (기존 useState와 동일)
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("itemName,asc");

  // ⭐️ 2. 모달 상태 (기존 useState와 동일)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);

  // ⭐️ 3. API 요청 파라미터 객체화
  const queryParams = {
    storeId: currentStoreId!,
    q: searchQuery,
    page,
    size: pageSize,
    sort,
  };

  // ⭐️ 4. (핵심) 재고 목록 조회: useQuery로 대체
  // (기존 fetchInventory + items + loading + error + useEffect 통합)
  const {
    data: inventoryData,
    isLoading: isInventoryLoading,
    error: inventoryError,
  } = useQuery({
    queryKey: ["inventory", queryParams], // ⭐️ queryParams가 바뀌면 자동 재조회
    queryFn: () => getInventory(queryParams),
    enabled: !!currentStoreId, // ⭐️ storeId가 있을 때만 실행
  });

  // ⭐️ 5. (핵심) 재고 부족 목록 조회: 별도 useQuery로 분리
  // (기존 fetchLowStockAll + lowStockLoading + lowStockAll 통합)
  const {
    data: lowStockItems,
    isLoading: isLowStockLoading,
  } = useQuery({
    queryKey: ["inventory", currentStoreId, "lowStock"],
    queryFn: async () => {
      const res = await getInventory({
        storeId: currentStoreId!,
        page: 0,
        size: 1000, // ⭐️ 전체 조회를 위한 큰 사이즈
        sort: "itemName,asc",
        q: "",
      });
      const all = res.content ?? [];
      return all.filter((i) => Number(i.stockQty) < Number(i.safetyQty));
    },
    enabled: !!currentStoreId,
  });

  // ⭐️ 6. (핵심) 재고 생성: useMutation으로 대체 (기존 handleCreate)
  const createMutation = useMutation({
    mutationFn: createInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] }); // ⭐️ 목록/부족 목록 동시 갱신
      setIsAddModalOpen(false); // ⭐️ 성공 시 모달 닫기
    },
    onError: (error) => alert(error.message), // ⭐️ apiClient가 에러 객체 반환
  });

  // ⭐️ 7. (핵심) 재고 수정: useMutation으로 대체 (기존 handleUpdate)
  const updateMutation = useMutation({
    mutationFn: ({ itemId, body }: { itemId: number; body: InventoryFormValues }) =>
      updateInventory(itemId, { 
        ...body, 
        storeId: currentStoreId!,
        stockQty: Number(body.stockQty), // ⭐️ 숫자 변환
        safetyQty: Number(body.safetyQty), // ⭐️ 숫자 변환
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setIsEditModalOpen(false);
      setEditingItem(null);
    },
    onError: (error) => alert(error.message),
  });

  // ⭐️ 8. (핵심) 재고 삭제: useMutation으로 대체 (기존 handleDelete)
  const deleteMutation = useMutation({
    mutationFn: deleteInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (error) => alert(error.message),
  });

  // ⭐️ 9. 이벤트 핸들러 (Page 컴포넌트에 전달될 함수들)
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(0); // ⭐️ 검색 시 1페이지로
  };

  const handleCreate = (values: InventoryFormValues) => {
    createMutation.mutate({
      ...values,
      storeId: currentStoreId!,
      stockQty: Number(values.stockQty),
      safetyQty: Number(values.safetyQty),
    });
  };

  const handleUpdate = (values: InventoryFormValues) => {
    if (!editingItem) return;
    updateMutation.mutate({ itemId: editingItem.itemId, body: values });
  };

  const handleDelete = (itemId: number) => {
    if (confirm("정말 이 품목을 삭제하시겠습니까?")) {
      deleteMutation.mutate(itemId);
    }
  };

  const openAddModal = () => setIsAddModalOpen(true);
  
  const openEditModal = (item: Inventory) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };
  
  const goToPage = (p: number) => {
    if (p < 0 || p > (inventoryData?.totalPages ?? 0) - 1) return;
    setPage(p);
  };

  // ⭐️ 10. Page 컴포넌트에 반환할 모든 상태와 함수
  return {
    inventoryData,
    isInventoryLoading,
    inventoryError,
    
    lowStockItems: lowStockItems ?? [],
    isLowStockLoading,
    
    page,
    pageSize,
    setPageSize,
    goToPage,
    searchQuery,
    handleSearch,

    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    editingItem,

    openAddModal,
    openEditModal,
    handleCreate,
    handleUpdate,
    handleDelete,
    
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}