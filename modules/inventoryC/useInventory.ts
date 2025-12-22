// modules/inventoryC/useInventory.ts
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/contexts/StoreContext";
import { inventoryApi } from "./inventoryApi";
import type { Inventory, InventoryUpsertBody, InventoryStatus } from "./inventoryTypes";

const DEFAULT_PAGE_SIZE = 10;

// 폼 값 타입
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

  // 필터 상태
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const sort = "itemName,asc";
  const [itemTypeFilter, setItemTypeFilter] = useState<string | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);

  // 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);

  // ✅ [수정] status 타입을 InventoryStatus로 명시
  const currentStatus: InventoryStatus = showInactiveOnly ? "INACTIVE" : "ACTIVE";
  
  const queryParams = {
    storeId: currentStoreId!,
    q: searchQuery,
    page,
    size: pageSize,
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
    queryKey: ["inventory", queryParams],
    queryFn: () => inventoryApi.getInventory(queryParams),
    enabled: !!currentStoreId,
  });

  // 2. 재고 부족 알림 조회 (활성 재고 전체 로딩 후 필터링)
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
      setPage(0);
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(0);
  };

  const handleChangeItemType = (value: string) => {
    setItemTypeFilter(value || undefined);
    setPage(0);
  };

  const goToPage = (p: number) => {
    if (p >= 0 && p < (inventoryData?.totalPages ?? 0)) setPage(p);
  };

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
    openAddModal: () => { setEditingItem(null); setIsAddModalOpen(true); },
    openEditModal: (item: Inventory) => { setEditingItem(item); setIsEditModalOpen(true); },
    handleCreate,
    handleUpdate,
    handleDeactivate,
    handleReactivate,
    handleExportExcel,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeactivating: deactivateMutation.isPending,
    isReactivating: reactivateMutation.isPending,
  };
}