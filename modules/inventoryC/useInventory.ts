// modules/inventoryC/useInventory.ts
"use client";
//테스트
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/contexts/StoreContext";
import { inventoryApi } from "./inventoryApi";
import type { Inventory, InventoryUpsertBody, InventoryStatus } from "./inventoryTypes";
import { useSearch } from "@/shared/hooks/useSearch";
import { usePagination } from "@/shared/hooks/usePagination";

const DEFAULT_PAGE_SIZE = 10;

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

  // ✅ 공용 훅 사용
  const pagination = usePagination({ initialSize: DEFAULT_PAGE_SIZE });
  const search = useSearch({
    onSearch: () => pagination.resetPage(), // 검색 시 1페이지로 리셋
  });

  // 필터 상태
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const [itemTypeFilter, setItemTypeFilter] = useState<string | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  
  // 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);

  const currentStatus: InventoryStatus = showInactiveOnly ? "INACTIVE" : "ACTIVE";
  const sort = "itemName,asc";

  // API 파라미터 (activeKeyword 사용 -> 엔터 쳐야만 변경됨)
  const queryParams = {
    storeId: currentStoreId!,
    q: search.activeKeyword, 
    page: pagination.page,
    size: pagination.size,
    sort,
    status: currentStatus,
    itemType: itemTypeFilter,
  };

  // 1. 목록 조회
  const {
    data: inventoryData,
    isLoading: isInventoryLoading,
    error: inventoryError,
  } = useQuery({
    queryKey: ["inventory", queryParams], // activeKeyword가 바뀌어야 재요청됨
    queryFn: () => inventoryApi.getInventory(queryParams),
    enabled: !!currentStoreId,
  });

  // 2. 재고 부족 알림 조회
  const {
    data: lowStockItems,
    isLoading: isLowStockLoading,
  } = useQuery({
    queryKey: ["inventory", currentStoreId, "lowStock"],
    queryFn: async () => {
      const res = await inventoryApi.getInventory({
        storeId: currentStoreId!,
        page: 0,
        size: 1000,
        sort: "itemName,asc",
        q: "",
        status: "ACTIVE",
      });
      const allActiveItems = res.content ?? [];
      return allActiveItems.filter((i) => Number(i.stockQty) < Number(i.safetyQty));
    },
    enabled: !!currentStoreId,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (body: InventoryUpsertBody) => inventoryApi.createInventory(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", currentStoreId, "lowStock"] });
      setIsAddModalOpen(false);
      pagination.resetPage();
    },
    onError: (error: any) => alert(`생성 실패: ${error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, body }: { itemId: number; body: InventoryUpsertBody }) =>
      inventoryApi.updateInventory(itemId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", currentStoreId, "lowStock"] });
      setIsEditModalOpen(false);
      setEditingItem(null);
    },
    onError: (error: any) => alert(`수정 실패: ${error.message}`),
  });

  const deactivateMutation = useMutation({
    mutationFn: (itemId: number) => inventoryApi.deactivateInventory(itemId, currentStoreId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", currentStoreId, "lowStock"] });
    },
    onError: (error: any) => alert(error.message),
  });

  const reactivateMutation = useMutation({
    mutationFn: (itemId: number) => inventoryApi.reactivateInventory(itemId, currentStoreId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", currentStoreId, "lowStock"] });
    },
    onError: (error: any) => alert(error.message),
  });

  // Handlers
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
    updateMutation.mutate({
      itemId: editingItem.itemId,
      body: {
        ...values,
        storeId: currentStoreId!,
        stockQty: Number(values.stockQty),
        safetyQty: Number(values.safetyQty),
      }
    });
  };

  const handleDeactivate = (itemId: number) => {
    if (confirm("이 품목을 비활성화할까요?")) {
      deactivateMutation.mutate(itemId);
    }
  };

  const handleReactivate = (itemId: number) => {
    if (confirm("이 품목을 활성화(해제)할까요?")) {
      reactivateMutation.mutate(itemId);
    }
  };

  const handleExportExcel = async () => {
    if (!currentStoreId) return alert("매장이 선택되지 않았습니다.");
    try {
      setIsExporting(true);
      const blob = await inventoryApi.downloadInventoryExcel(currentStoreId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventory_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("엑셀 내보내기 실패");
    } finally {
      setIsExporting(false);
    }
  };

  const handleChangeItemType = (value: string) => {
    setItemTypeFilter(value || undefined);
    pagination.resetPage();
  };

  const goToPage = (p: number) => {
    if (p >= 0 && p < (inventoryData?.totalPages ?? 0)) pagination.handlePageChange(p);
  };

  return {
    inventoryData,
    isInventoryLoading,
    inventoryError,
    lowStockItems: lowStockItems ?? [],
    isLowStockLoading,
    
    // 페이징 & 검색
    page: pagination.page,
    pageSize: pagination.size,
    setPageSize: pagination.handleSizeChange,
    goToPage,
    
    searchQuery: search.keyword,           // Input value
    setSearchQuery: search.handleChange,   // ✅ [수정] 누락되었던 핸들러 추가
    handleSearch: search.submitSearch,     // Button onClick
    handleKeyDown: search.handleKeyDown,   // Input onKeyDown (Enter)
    
    // 필터 및 모달
    showInactiveOnly,
    setShowInactiveOnly,
    itemTypeFilter,
    handleChangeItemType,
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    editingItem,
    isExporting,
    
    // Actions
    openAddModal: () => { setEditingItem(null); setIsAddModalOpen(true); },
    openEditModal: (item: Inventory) => { setEditingItem(item); setIsEditModalOpen(true); },
    handleCreate,
    handleUpdate,
    handleDeactivate,
    handleReactivate,
    handleExportExcel,
    
    // Loading States
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeactivating: deactivateMutation.isPending,
    isReactivating: reactivateMutation.isPending,
  };
}