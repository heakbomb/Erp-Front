// features/inventory/hooks/useInventory.ts
"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../../contexts/StoreContext"; 
import {
  getInventory,
  createInventory,
  updateInventory,
  deactivateInventory,
  reactivateInventory,
} from "../inventoryService"; 
import type { Inventory } from "../../../lib/types/database"; 

export type InventoryFormValues = {
  itemName: string;
  itemType: string;
  stockType: string;
  stockQty: number | "";
  safetyQty: number | "";
};

export function useInventory() {
  const { currentStoreId } = useStore();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const sort = "itemName,asc";
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);

  // ⭐️ 1. (ts-2345 에러 수정) status 타입을 명확히 추론하도록 변수 분리
  const currentStatus: "ACTIVE" | "INACTIVE" = showInactiveOnly ? "INACTIVE" : "ACTIVE";

  // ⭐️ 3. API 요청 파라미터 (status 추가)
  const queryParams = {
    storeId: currentStoreId!,
    q: searchQuery,
    page,
    size: pageSize,
    sort,
    status: currentStatus, // ⭐️ 'string'이 아닌 'ACTIVE'|'INACTIVE' 타입으로 추론됨
  };

  // ⭐️ 4. (핵심) 재고 목록 조회: useQuery
  const {
    data: inventoryData,
    isLoading: isInventoryLoading,
    error: inventoryError,
  } = useQuery({
    queryKey: ["inventory", queryParams], 
    queryFn: () => getInventory(queryParams),
    enabled: !!currentStoreId, 
  });

  // ⭐️ 5. (핵심) 재고 부족 목록 조회
  const {
    data: lowStockItems,
    isLoading: isLowStockLoading,
  } = useQuery({
    queryKey: ["inventory", currentStoreId, "lowStock"],
    queryFn: async () => {
      const res = await getInventory({
        storeId: currentStoreId!,
        page: 0,
        size: 1000, 
        sort: "itemName,asc",
        q: "",
        status: "ACTIVE", // ⭐️ '활성' 재고만 필터링
      });
      const all = res.content ?? [];
      return all.filter((i) => Number(i.stockQty) < Number(i.safetyQty));
    },
    enabled: !!currentStoreId,
  });

  // ⭐️ 6. (핵심) 재고 생성 (동일)
  const createMutation = useMutation({
    mutationFn: createInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] }); 
      setIsAddModalOpen(false); 
    },
    onError: (error) => alert(error.message), 
  });

  // ⭐️ 7. (핵심) 재고 수정 (동일)
  const updateMutation = useMutation({
    mutationFn: ({ itemId, body }: { itemId: number; body: InventoryFormValues }) =>
      updateInventory(itemId, { 
        ...body, 
        storeId: currentStoreId!,
        stockQty: Number(body.stockQty), 
        safetyQty: Number(body.safetyQty), 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setIsEditModalOpen(false);
      setEditingItem(null);
    },
    onError: (error) => alert(error.message),
  });

  // ⭐️ 8. (핵심) 'deleteMutation'을 'deactivate/reactivate'로 대체
  const deactivateMutation = useMutation({
    mutationFn: deactivateInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (error) => alert(error.message),
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateInventory,
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

  // ⭐️ 10. 'handleDelete' 대신 'handleDeactivate/Reactivate' 핸들러
  const handleDeactivate = (itemId: number) => {
    if (confirm("이 품목을 비활성화할까요?")) {
      deactivateMutation.mutate({ itemId, storeId: currentStoreId! });
    }
  };

  const handleReactivate = (itemId: number) => {
    if (confirm("이 품목을 활성화(해제)할까요?")) {
      reactivateMutation.mutate({ itemId, storeId: currentStoreId! });
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

  // ⭐️ 11. Page 컴포넌트에 반환할 모든 상태와 함수 (수정됨)
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

    // ⭐️ 비활성 필터 상태
    showInactiveOnly,
    setShowInactiveOnly,

    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    editingItem,

    openAddModal,
    openEditModal,
    handleCreate,
    handleUpdate,
    
    // ⭐️ 핸들러 및 상태 변경
    handleDeactivate,
    handleReactivate,
    
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeactivating: deactivateMutation.isPending,
    isReactivating: reactivateMutation.isPending,
  };
}