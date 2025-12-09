// features/menu/hooks/useMenu.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useStore } from "@/contexts/StoreContext";

import {
  ActiveStatus,
  MenuItemResponse,
  InventoryResponse,
  RecipeIngredientResponse,
  fetchInventory,
  fetchMenus,
  createMenu,
  updateMenu,
  deactivateMenu,
  reactivateMenu,
  fetchMenuStats,
} from "../menuService";

export type MenuFormValues = {
  menuName: string;
  price: number | "";
};

export function useMenu() {
  const { currentStoreId } = useStore();
  const queryClient = useQueryClient();

  // 🔍 검색/필터
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);

  // 📄 페이지네이션 상태
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(6); // ✅ 1페이지 6개

  // 인벤토리 & 레시피
  const [invOptions, setInvOptions] = useState<InventoryResponse[]>([]);
  const [recipeMap, setRecipeMap] = useState<
    Record<number, RecipeIngredientResponse[]>
  >({});

  // 메뉴 모달
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItemResponse | null>(null);

  // 레시피 모달
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedMenuForRecipe, setSelectedMenuForRecipe] =
    useState<MenuItemResponse | null>(null);

  /** 1) 인벤토리 로드 */
  useEffect(() => {
    if (!currentStoreId) return;

    const run = async () => {
      try {
        const list = await fetchInventory(currentStoreId);
        setInvOptions(list);
      } catch {
        setInvOptions([]);
      }
    };
    run();
  }, [currentStoreId]);

  /** 2) 메뉴 목록 쿼리 */
  const status: ActiveStatus | undefined = showInactiveOnly
    ? "INACTIVE"
    : "ACTIVE";

  const {
    data: menuPage,
    isLoading: loading,
    error,
  } = useQuery({
    // ✅ page / pageSize 를 키에 포함
    queryKey: ["menus", currentStoreId, searchQuery, status, page, pageSize],
    queryFn: () =>
      fetchMenus({
        storeId: currentStoreId!,
        q: searchQuery || undefined,
        status,
        page,
        size: pageSize, // ✅ 여기서 6개씩 요청
        sort: "menuName,asc",
      }),
    enabled: !!currentStoreId,
  });

  const items: MenuItemResponse[] = menuPage?.content ?? [];
  const totalPages = menuPage?.totalPages ?? 0; // ✅ 전체 페이지 수

  /** 2-1) 메뉴 통계 쿼리 */
  const { data: statsData } = useQuery({
    queryKey: ["menuStats", currentStoreId],
    queryFn: () => fetchMenuStats(currentStoreId!),
    enabled: !!currentStoreId,
  });

  /** 3) 원가/마진 계산 */
  const calculatedCostMap = useMemo(() => {
    const map: Record<number, number> = {};
    for (const m of items) {
      map[m.menuId] = Number(m.calculatedCost ?? 0);
    }
    return map;
  }, [items]);

  const stats = useMemo(() => {
    const total = statsData?.totalMenus ?? 0;
    const inactive = statsData?.inactiveMenus ?? 0;

    if (!items.length) {
      return { total, avgMargin: 0, inactive };
    }

    const margins = items.map((m) => {
      const price = Number(m.price || 0);
      const cost = Number(m.calculatedCost ?? 0);
      if (price <= 0) return 0;
      return ((price - cost) / price) * 100;
    });

    const avgMargin =
      margins.reduce((a, b) => a + b, 0) / Math.max(1, margins.length);

    return { total, avgMargin, inactive };
  }, [items, statsData]);

  /** 4) 메뉴 CRUD + 상태 토글 (기존 그대로) */
  const invalidateMenus = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["menus"] });
    queryClient.invalidateQueries({ queryKey: ["menuStats"] });
  }, [queryClient]);

  const handleCreate = async (values: MenuFormValues) => {
    if (
      !values.menuName.trim() ||
      values.price === "" ||
      isNaN(Number(values.price))
    ) {
      alert("메뉴명과 판매가를 올바르게 입력하세요.");
      return;
    }
    if (!currentStoreId) {
      alert("가게가 선택되지 않았습니다.");
      return;
    }

    try {
      await createMenu({
        storeId: currentStoreId,
        menuName: values.menuName.trim(),
        price: Number(values.price),
      });
      setIsAddModalOpen(false);
      setPage(0); // ✅ 새로 만들면 1페이지로
      invalidateMenus();
    } catch (e: any) {
      console.error(e);
      const hint =
        e?.response?.status === 404
          ? "지정한 매장이 존재하는지 확인하세요."
          : e?.response?.status === 409
          ? "동일한 메뉴명이 이미 존재합니다."
          : e?.response?.status === 400
          ? "입력값을 확인하세요."
          : "";
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        "생성 중 오류가 발생했습니다.";
      alert([msg, hint].filter(Boolean).join("\n"));
    }
  };

  const handleUpdate = async (values: MenuFormValues) => {
    if (!editingMenu) return;
    if (
      !values.menuName.trim() ||
      values.price === "" ||
      isNaN(Number(values.price))
    ) {
      alert("메뉴명과 판매가를 올바르게 입력하세요.");
      return;
    }
    if (!currentStoreId) {
      alert("가게가 선택되지 않았습니다.");
      return;
    }

    try {
      await updateMenu(editingMenu.menuId, {
        storeId: currentStoreId,
        menuName: values.menuName.trim(),
        price: Number(values.price),
      });
      setIsEditModalOpen(false);
      setEditingMenu(null);
      invalidateMenus();
    } catch (e: any) {
      console.error(e);
      const hint =
        e?.response?.status === 404
          ? "메뉴ID/매장ID를 확인하세요."
          : e?.response?.status === 409
          ? "변경하려는 이름이 이미 존재합니다."
          : e?.response?.status === 400
          ? "storeId 쿼리 파라미터가 필요한지 확인하세요."
          : "";
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        "수정 중 오류가 발생했습니다.";
      alert([msg, hint].filter(Boolean).join("\n"));
    }
  };

  const toggleStatus = async (row: MenuItemResponse) => {
    if (!currentStoreId) {
      alert("가게가 선택되지 않았습니다.");
      return;
    }

    const isActive = row.status === "ACTIVE";
    const ok = window.confirm(
      isActive
        ? "이 메뉴를 비활성화할까요?"
        : "이 메뉴를 활성화할까요?"
    );
    if (!ok) return;

    try {
      if (isActive) {
        await deactivateMenu(row.menuId, currentStoreId);
      } else {
        await reactivateMenu(row.menuId, currentStoreId);
      }
      invalidateMenus();
    } catch (e: any) {
      console.error(e);
      const hint =
        e?.response?.status === 400
          ? "storeId 쿼리 파라미터가 누락되지 않았는지 확인하세요."
          : e?.response?.status === 404
          ? "해당 메뉴가 존재하는지 확인하세요."
          : "";
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        "상태 변경 중 오류가 발생했습니다.";
      alert([msg, hint].filter(Boolean).join("\n"));
    }
  };

  /** 5) 모달 헬퍼 & 레시피 핸들러 */
  const openAddModal = () => {
    setEditingMenu(null);
    setIsEditModalOpen(false);
    setIsAddModalOpen(true);
  };

  const openEditModal = (row: MenuItemResponse) => {
    setEditingMenu(row);
    setIsAddModalOpen(false);
    setIsEditModalOpen(true);
  };

  const openRecipeModal = (row: MenuItemResponse) => {
    setSelectedMenuForRecipe(row);
    setIsRecipeModalOpen(true);
  };

  const handleRecipeUpdated = (
    menuId: number,
    list: RecipeIngredientResponse[]
  ) => {
    setRecipeMap((prev) => ({
      ...prev,
      [menuId]: list,
    }));
    invalidateMenus();
  };

  /** 📄 페이지 이동 함수 */
  const goToPage = (p: number) => {
    if (!menuPage) return;
    if (p < 0 || p >= totalPages) return;
    setPage(p);
  };

  /** 6) 훅 리턴 */
  return {
    // 데이터
    items,
    loading,
    error: error ? (error as Error).message : null,
    calculatedCostMap,
    stats,

    // 검색/필터
    searchQuery,
    setSearchQuery,
    showInactiveOnly,
    setShowInactiveOnly,

    // 페이지네이션
    page,
    pageSize,
    setPageSize,
    totalPages,
    goToPage,

    // 인벤토리 / 레시피
    invOptions,
    recipeMap,
    onRecipeUpdated: handleRecipeUpdated,

    // 메뉴 모달
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    editingMenu,
    openAddModal,
    openEditModal,
    handleCreate,
    handleUpdate,
    toggleStatus,

    // 레시피 모달
    isRecipeModalOpen,
    setIsRecipeModalOpen,
    selectedMenuForRecipe,
    openRecipeModal,
  };
}
