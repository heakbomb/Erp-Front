// modules/purchasesC/usePurchases.ts
"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/contexts/StoreContext";
import { purchasesApi } from "./purchasesApi";
import { useSearch } from "@/shared/hooks/useSearch"; // ✅ useSearch import
import type { 
  PurchaseHistoryResponse, 
  InventoryOption, 
  CreateInventoryBody 
} from "./purchasesTypes";

// 날짜 유틸
export const TODAY = (() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
})();

// 폼 타입 정의
export type PurchaseFormValues = {
  formItemId: string;
  formQty: number | "";
  formUnitPrice: number | "";
  formDate: string;
  newItemMode: boolean;
  newItemName: string;
  newItemType: string;
  newStockType: string;
};

export function usePurchases() {
  const { currentStoreId } = useStore();
  const queryClient = useQueryClient();

  // 상태 관리
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  
  // ✅ [수정] useSearch 훅 올바르게 사용
  // 1. 인자를 객체 { onSearch: ... } 형태로 전달
  // 2. 반환값을 컴포넌트에서 사용하는 이름으로 매핑 (keyword -> searchQuery 등)
  const { 
    keyword: searchQuery, 
    setKeyword: setSearchQuery, 
    activeKeyword, 
    handleKeyDown, 
    submitSearch: handleSearch 
  } = useSearch({
    onSearch: () => setPage(0), // 검색 실행 시 페이지 초기화
  });

  const [editingPurchase, setEditingPurchase] = useState<PurchaseHistoryResponse | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // 1. 매입 내역 조회
  const queryParams = {
    storeId: currentStoreId!,
    page,
    size,
    sort: "purchaseDate,desc",
    itemId: selectedItemId ? Number(selectedItemId) : undefined,
    from: startDate || undefined,
    to: endDate || undefined,
  };

  const purchasesQuery = useQuery({
    queryKey: ["purchases", queryParams],
    queryFn: () => purchasesApi.getPurchases(queryParams),
    enabled: !!currentStoreId,
  });

  // 2. 재고 옵션 조회
  const inventoryQuery = useQuery({
    queryKey: ["inventoryOptions", currentStoreId],
    queryFn: () => purchasesApi.getInventoryForOptions(currentStoreId!),
    enabled: !!currentStoreId,
  });

  const inventoryOpts: InventoryOption[] = inventoryQuery.data ?? [];

  // Mutations
  const createInventoryMutation = useMutation({
    mutationFn: (vars: CreateInventoryBody) => purchasesApi.createInventory(vars),
    onSuccess: (newItem) => {
      queryClient.setQueryData(
        ["inventoryOptions", currentStoreId],
        (oldData: InventoryOption[] | undefined) => oldData ? [...oldData, newItem] : [newItem]
      );
    },
    onError: (error: any) => alert("새 품목 생성 실패: " + (error.response?.data?.message || error.message)),
  });

  const createPurchaseMutation = useMutation({
    mutationFn: purchasesApi.createPurchase,
    onSuccess: () => {
      setIsAddOpen(false);
      setPage(0);
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] }); // 재고 수량/단가 변동 반영
    },
    onError: (error: any) => alert("매입 등록 실패: " + (error.response?.data?.message || error.message)),
  });

  const updatePurchaseMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => purchasesApi.updatePurchase(id, body),
    onSuccess: () => {
      setIsAddOpen(false);
      setEditingPurchase(null);
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (error: any) => alert("매입 수정 실패: " + (error.response?.data?.message || error.message)),
  });

  const deletePurchaseMutation = useMutation({
    mutationFn: purchasesApi.deletePurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (error: any) => alert("삭제 실패: " + (error.response?.data?.message || error.message)),
  });

  // Handlers
  const handleEditClick = (purchase: PurchaseHistoryResponse) => {
    setEditingPurchase(purchase);
    setIsAddOpen(true);
  };

  const handleDeleteClick = async (purchaseId: number) => {
    if (confirm("정말 이 매입 내역을 삭제하시겠습니까? 재고가 다시 차감됩니다.")) {
      deletePurchaseMutation.mutate(purchaseId);
    }
  };

  const handleModalClose = (open: boolean) => {
    setIsAddOpen(open);
    if (!open) setEditingPurchase(null);
  };

  const handleSubmit = async (values: PurchaseFormValues) => {
    if (!currentStoreId) return;

    if (editingPurchase) {
      updatePurchaseMutation.mutate({
        id: editingPurchase.purchaseId,
        body: {
          storeId: currentStoreId,
          purchaseQty: Number(values.formQty),
          unitPrice: Number(values.formUnitPrice),
          purchaseDate: values.formDate,
        },
      });
      return;
    }

    let itemIdToUse: number | null = null;
    
    if (values.newItemMode) {
      // 새 품목 생성 로직
      const norm = (s: string) => s.trim().toLowerCase();
      const exist = inventoryOpts.find(i => norm(i.itemName) === norm(values.newItemName));
      
      if (exist) {
        itemIdToUse = exist.itemId;
      } else {
        try {
          const newInv = await createInventoryMutation.mutateAsync({
            storeId: currentStoreId,
            itemName: values.newItemName.trim(),
            itemType: values.newItemType.trim(),
            stockType: values.newStockType.trim(),
            stockQty: Number(values.formQty),
            safetyQty: 0,
            status: "ACTIVE",
          });
          itemIdToUse = newInv.itemId;
        } catch (e) { return; }
      }
    } else {
      itemIdToUse = Number(values.formItemId);
    }

    if (!itemIdToUse) return alert("품목을 선택하거나 생성해야 합니다.");

    createPurchaseMutation.mutate({
      storeId: currentStoreId,
      itemId: itemIdToUse,
      purchaseQty: Number(values.formQty),
      unitPrice: Number(values.formUnitPrice),
      purchaseDate: values.formDate,
    });
  };

  // 파생 상태
  const rows = purchasesQuery.data?.content ?? [];
  
  const totalAmount = useMemo(() => {
    return rows.reduce((sum, r) => sum + Number(r.purchaseQty) * Number(r.unitPrice), 0);
  }, [rows]);

  // ✅ [수정] activeKeyword 사용 (검색 버튼/엔터 입력 시 업데이트된 값)
  const filteredRows = useMemo(() => {
    if (!activeKeyword.trim()) return rows;
    const t = activeKeyword.trim().toLowerCase();
    return rows.filter((r) => {
      // API에서 itemId만 오므로 inventoryOpts에서 이름을 찾음
      const inv = inventoryOpts.find(i => i.itemId === r.itemId);
      const name = inv?.itemName?.toLowerCase() || r.itemName?.toLowerCase() || "";
      return name.includes(t);
    });
  }, [rows, activeKeyword, inventoryOpts]);

  const handlePageChange = (p: number) => {
    if (p >= 0 && p < (purchasesQuery.data?.totalPages ?? 0)) setPage(p);
  };

  return {
    purchasesQuery,
    inventoryQuery,
    filteredRows,
    inventoryOpts,
    isLoading: purchasesQuery.isLoading,
    error: purchasesQuery.error as Error | null,
    
    selectedItemId, setSelectedItemId,
    startDate, setStartDate,
    endDate, setEndDate,
    
    // ✅ 반환값 유지 (useSearch에서 매핑함)
    searchQuery,    // input value
    setSearchQuery, // state setter
    handleSearch,   // 검색 실행 함수
    handleKeyDown,  // 엔터 키 핸들러
    
    size, setSize,
    
    page,
    totalPages: purchasesQuery.data?.totalPages ?? 0,
    totalElements: purchasesQuery.data?.totalElements ?? 0,
    handlePageChange,
    
    totalAmount,
    isAddOpen, setIsAddOpen,
    editingPurchase,
    handleEditClick,
    handleDeleteClick,
    handleModalClose,
    handleSubmit,
    isSubmitting: createInventoryMutation.isPending || createPurchaseMutation.isPending || updatePurchaseMutation.isPending || deletePurchaseMutation.isPending,
  };
}