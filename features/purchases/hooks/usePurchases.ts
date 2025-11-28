// features/purchases/hooks/usePurchases.ts
"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/contexts/StoreContext";
import {
  getPurchases,
  getInventoryForOptions,
  createPurchase,
  createInventory,
  updatePurchase,
  deletePurchase
} from "../purchasesService";
import type { InventoryOption, PurchaseHistoryResponse } from "../purchasesService";

// 1. 폼 검증 및 타입을 위한 상수
export const TODAY = new Date().toISOString().slice(0, 10);

// 2. react-hook-form에서 사용할 폼 타입
export type PurchaseFormValues = {
  formItemId: string; // select-box는 문자열로 관리
  formQty: number | "";
  formUnitPrice: number | "";
  formDate: string;
  // 새 품목
  newItemMode: boolean;
  newItemName: string;
  newItemType: string;
  newStockType: string;
};

export function usePurchases() {
  const { currentStoreId } = useStore();
  const queryClient = useQueryClient();

  // 1. 필터/페이지 상태
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [searchText, setSearchText] = useState(""); 
  
  // ✅ 수정 모드 상태 (null이면 생성 모드)
  const [editingPurchase, setEditingPurchase] = useState<PurchaseHistoryResponse | null>(null);

  // 2. 모달 상태
  const [isAddOpen, setIsAddOpen] = useState(false);

  // 3. (Query) 매입 내역 조회
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
    queryFn: () => getPurchases(queryParams),
    enabled: !!currentStoreId,
  });

  // 4. (Query) 재고 옵션 조회
  const inventoryQuery = useQuery({
    queryKey: ["inventoryOptions", currentStoreId],
    queryFn: () => getInventoryForOptions(currentStoreId!),
    enabled: !!currentStoreId,
  });
  
  const inventoryOpts: InventoryOption[] = inventoryQuery.data ?? [];

  // 5. (Mutation) 재고 생성
  const createInventoryMutation = useMutation({
    mutationFn: createInventory,
    onSuccess: (newItem) => {
      queryClient.setQueryData(
        ["inventoryOptions", currentStoreId],
        (oldData: InventoryOption[] | undefined) => (oldData ? [...oldData, newItem] : [newItem])
      );
    },
    onError: (error) => alert(`새 품목 생성 실패: ${error.message}`),
  });

  // 6. (Mutation) 매입 기록 생성
  const createPurchaseMutation = useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      setIsAddOpen(false);
      setPage(0);
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] }); 
    },
    onError: (error) => alert(`매입 등록 실패: ${error.message}`),
  });

  // ✅ (Mutation) 매입 기록 수정
  const updatePurchaseMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => updatePurchase(id, body),
    onSuccess: () => {
      setIsAddOpen(false);
      setEditingPurchase(null); // 수정 모드 종료
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (error) => alert(`매입 수정 실패: ${error.message}`),
  });

  // ✅ (Mutation) 매입 기록 삭제
  const deletePurchaseMutation = useMutation({
    mutationFn: deletePurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (error) => alert(`삭제 실패: ${error.message}`),
  });

  // ✅ 수정 버튼 클릭 시 핸들러
  const handleEditClick = (purchase: PurchaseHistoryResponse) => {
    setEditingPurchase(purchase); 
    setIsAddOpen(true); 
  };

  // ✅ 삭제 버튼 클릭 시 핸들러
  const handleDeleteClick = async (purchaseId: number) => {
    if (confirm("정말 이 매입 내역을 삭제하시겠습니까? 재고가 다시 차감됩니다.")) {
      deletePurchaseMutation.mutate(purchaseId);
    }
  };

  // ✅ 모달 닫기 핸들러 (수정 상태 초기화 포함)
  const handleModalClose = (open: boolean) => {
    setIsAddOpen(open);
    if (!open) {
      setEditingPurchase(null);
    }
  };

  // 7. 이벤트 핸들러: 모달 제출 (생성 및 수정 분기 처리)
  const handleSubmit = async (values: PurchaseFormValues) => {
    // 🅰️ 수정 모드일 때
    if (editingPurchase) {
      updatePurchaseMutation.mutate({
        id: editingPurchase.purchaseId,
        body: {
          storeId: currentStoreId!,
          purchaseQty: Number(values.formQty),
          unitPrice: Number(values.formUnitPrice),
          purchaseDate: values.formDate,
        }
      });
      return;
    }

    // 🅱️ 생성 모드일 때 (기존 로직)
    const norm = (s: string) => s.trim().toLowerCase();
    let itemIdToUse: number | null = null;
    const inventoryOptions = inventoryQuery.data ?? [];

    try {
      if (values.newItemMode) {
        // 1) 새 품목 모드
        const exist = inventoryOptions.find(
          (i) => norm(i.itemName) === norm(values.newItemName)
        );
        if (exist) {
          itemIdToUse = exist.itemId;
        } else {
          const newInv = await createInventoryMutation.mutateAsync({
            storeId: currentStoreId!,
            itemName: values.newItemName.trim(),
            itemType: values.newItemType.trim(),
            stockType: values.newStockType.trim(),
          });
          itemIdToUse = newInv.itemId;
        }
      } else {
        // 2) 기존 품목 선택 모드
        itemIdToUse = Number(values.formItemId);
      }

      if (!itemIdToUse) {
        alert("품목을 선택하거나 생성해야 합니다.");
        return;
      }

      createPurchaseMutation.mutate({
        storeId: currentStoreId!,
        itemId: itemIdToUse,
        purchaseQty: Number(values.formQty),
        unitPrice: Number(values.formUnitPrice),
        purchaseDate: values.formDate,
      });
    } catch (e: any) {
      console.error(e);
    }
  };
  
  // 8. 파생 상태 (Memo)
  const rows = purchasesQuery.data?.content ?? [];

  const totalAmount = useMemo(() => {
    return rows.reduce((sum, r) => sum + Number(r.purchaseQty) * Number(r.unitPrice), 0);
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (!searchText.trim()) return rows;
    const t = searchText.trim().toLowerCase();
    return rows.filter((r) => {
      const inv = inventoryOpts.find((i) => i.itemId === r.itemId);
      const name = inv?.itemName?.toLowerCase() || "";
      return name.includes(t);
    });
  }, [rows, searchText, inventoryOpts]);

  // 9. 페이지 변경 핸들러
  const handlePageChange = (p: number) => {
    if (p >= 0 && p < (purchasesQuery.data?.totalPages ?? 0)) {
      setPage(p);
    }
  };

  // 10. UI 컴포넌트에 반환
  return {
    // 데이터
    purchasesQuery,
    inventoryQuery,
    filteredRows,
    inventoryOpts,

    // 로딩/에러
    isLoading: purchasesQuery.isLoading,
    error: purchasesQuery.error as Error | null,

    // 필터 상태
    selectedItemId, setSelectedItemId,
    startDate, setStartDate,
    endDate, setEndDate,
    searchText, setSearchText,
    size, setSize,

    // 페이지네이션
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
    
    isSubmitting: 
      createInventoryMutation.isPending || 
      createPurchaseMutation.isPending || 
      updatePurchaseMutation.isPending || 
      deletePurchaseMutation.isPending,
  };
}