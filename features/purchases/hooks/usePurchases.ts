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
  const [searchText, setSearchText] = useState(""); // ⭐️ UI 표시용 검색어 (즉시 반영)

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
      // ⭐️ 재고 옵션 목록을 즉시 갱신 (모달 드롭다운에 반영)
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
      setIsAddOpen(false); // 모달 닫기
      setPage(0); // 1페이지로 이동
      // ⭐️ 매입 내역 갱신
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      // ⭐️ 재고 목록도 갱신 (새 품목 추가 시 수량 반영 등)
      queryClient.invalidateQueries({ queryKey: ["inventory"] }); 
    },
    onError: (error) => alert(`매입 등록 실패: ${error.message}`),
  });

  // 7. 이벤트 핸들러: 모달 제출 (handleCreate)
  const handleSubmit = async (values: PurchaseFormValues) => {
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
          // ⭐️ mutateAsync를 사용해 생성 완료를 기다림
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

      // 3) 매입 기록 생성
      createPurchaseMutation.mutate({
        storeId: currentStoreId!,
        itemId: itemIdToUse,
        purchaseQty: Number(values.formQty),
        unitPrice: Number(values.formUnitPrice),
        purchaseDate: values.formDate,
      });
    } catch (e: any) {
      // (createInventoryMutation.mutateAsync 실패 시)
      console.error(e);
      // (Mutation의 onError가 이미 처리함)
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
    filteredRows, // ⭐️ UI 표시용 필터된 행
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

    // 통계
    totalAmount,

    // 모달
    isAddOpen, setIsAddOpen,
    handleSubmit,
    isSubmitting: createInventoryMutation.isPending || createPurchaseMutation.isPending,
  };
}