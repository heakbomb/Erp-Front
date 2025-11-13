// features/inventory/hooks/useInventory.ts
"use client";

import { useState } from "react";
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
import { DEFAULT_PAGE_SIZE } from "../../../lib/constants"; // ⭐️

// react-hook-form에서 사용할 폼 타입
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

  // 1. 목록 필터링 상태 (페이지, 검색, 탭)
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState(""); // ⭐️ API 호출용
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const sort = "itemName,asc";
  
  // 2. 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);

  // 3. API 요청 파라미터
  const currentStatus: "ACTIVE" | "INACTIVE" = showInactiveOnly ? "INACTIVE" : "ACTIVE";
  const queryParams = {
    storeId: currentStoreId!,
    q: searchQuery,
    page,
    size: pageSize,
    sort,
    status: currentStatus,
  };

  // 4. (Query) 재고 목록 조회
  const {
    data: inventoryData,
    isLoading: isInventoryLoading,
    error: inventoryError,
  } = useQuery({
    queryKey: ["inventory", queryParams], // ⭐️ queryParams 객체를 키로 사용
    queryFn: () => getInventory(queryParams),
    enabled: !!currentStoreId, 
  });

  // 5. (Query) 재고 부족 목록 조회
  const {
    data: lowStockItems,
    isLoading: isLowStockLoading,
  } = useQuery({
    queryKey: ["inventory", currentStoreId, "lowStock"],
    queryFn: async () => {
      const res = await getInventory({
        storeId: currentStoreId!,
        page: 0,
        size: 1000, // ⭐️ 안전 재고 계산을 위해 '활성' 재고 전체 조회
        sort: "itemName,asc",
        q: "",
        status: "ACTIVE", // ⭐️ '활성' 재고만 필터링
      });
      const allActiveItems = res.content ?? [];
      // ⭐️ JS에서 필터링
      return allActiveItems.filter((i) => Number(i.stockQty) < Number(i.safetyQty));
    },
    enabled: !!currentStoreId,
  });

  // 6. (Mutation) 재고 생성
  const createMutation = useMutation({
    mutationFn: createInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] }); 
      queryClient.invalidateQueries({ queryKey: ["inventory", currentStoreId, "lowStock"] }); // ⭐️ 재고 부족 목록도 갱신
      setIsAddModalOpen(false); 
      setPage(0); // ⭐️ 생성 후 1페이지로
    },
    onError: (error: Error) => alert(`생성 실패: ${error.message}`), 
  });

  // 7. (Mutation) 재고 수정
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
      queryClient.invalidateQueries({ queryKey: ["inventory", currentStoreId, "lowStock"] }); // ⭐️ 재고 부족 목록도 갱신
      setIsEditModalOpen(false);
      setEditingItem(null);
    },
    onError: (error: Error) => alert(`수정 실패: ${error.message}`),
  });

  // 8. (Mutation) 비활성화 / 활성화
  const deactivateMutation = useMutation({
    mutationFn: deactivateInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", currentStoreId, "lowStock"] });
    },
    onError: (error: Error) => alert(error.message),
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", currentStoreId, "lowStock"] });
    },
    onError: (error: Error) => alert(error.message),
  });

  // 9. 이벤트 핸들러: 폼 제출
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
  
  // 10. 이벤트 핸들러: 상태 변경
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

  // 11. 이벤트 핸들러: 모달 열기
  const openAddModal = () => {
    setEditingItem(null);
    setIsAddModalOpen(true);
  };
  
  const openEditModal = (item: Inventory) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };
  
  // 12. 이벤트 핸들러: 필터 변경
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(0); // 검색 시 1페이지로
  };

  const goToPage = (p: number) => {
    const totalPages = inventoryData?.totalPages ?? 0;
    if (p >= 0 && p < totalPages) {
      setPage(p);
    }
  };

  // 13. Page 컴포넌트에 반환
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
    
    searchQuery, // ⭐️ API 호출용 searchQuery 반환
    handleSearch, // ⭐️ 검색 제출 핸들러

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
    
    handleDeactivate,
    handleReactivate,
    
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeactivating: deactivateMutation.isPending,
    isReactivating: reactivateMutation.isPending,
  };
}