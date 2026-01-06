"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/contexts/StoreContext";
import { menuApi } from "./menuApi";
import type { ActiveStatus, MenuItem, InventoryItem, RecipeIngredient } from "./menuTypes";
import { useSearch } from "@/shared/hooks/useSearch";
import { usePagination } from "@/shared/hooks/usePagination";

export type MenuFormValues = {
  menuName: string;
  price: number | "";

  // ✅ 카테고리 추가
  categoryName: string;
  subCategoryName: string;
};

export function useMenu() {
  const { currentStoreId } = useStore();
  const queryClient = useQueryClient();

  const pagination = usePagination({ initialSize: 6 });
  const search = useSearch({
    onSearch: () => pagination.resetPage(),
  });

  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const [invOptions, setInvOptions] = useState<InventoryItem[]>([]);
  const [recipeMap, setRecipeMap] = useState<Record<number, RecipeIngredient[]>>({});

  // 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedMenuForRecipe, setSelectedMenuForRecipe] = useState<MenuItem | null>(null);

  useEffect(() => {
    if (!currentStoreId) return;
    menuApi.fetchInventory(currentStoreId).then(setInvOptions).catch(() => setInvOptions([]));
  }, [currentStoreId]);

  const status: ActiveStatus | undefined = showInactiveOnly ? "INACTIVE" : "ACTIVE";

  const { data: menuPage, isLoading: loading, error } = useQuery({
    queryKey: ["menus", currentStoreId, search.activeKeyword, status, pagination.page, pagination.size],
    queryFn: () =>
      menuApi.fetchMenus({
        storeId: currentStoreId!,
        q: search.activeKeyword || undefined,
        status,
        page: pagination.page,
        size: pagination.size,
        sort: "menuName,asc",
      }),
    enabled: !!currentStoreId,
  });

  const items = menuPage?.content ?? [];
  const totalPages = menuPage?.totalPages ?? 0;

  const { data: statsData } = useQuery({
    queryKey: ["menuStats", currentStoreId],
    queryFn: () => menuApi.fetchMenuStats(currentStoreId!),
    enabled: !!currentStoreId,
  });

  const calculatedCostMap = useMemo(() => {
    const map: Record<number, number> = {};
    for (const m of items) map[m.menuId] = Number(m.calculatedCost ?? 0);
    return map;
  }, [items]);

  const stats = useMemo(() => {
    const total = statsData?.totalMenus ?? 0;
    const inactive = statsData?.inactiveMenus ?? 0;
    if (!items.length) return { total, avgMargin: 0, inactive };

    const margins = items.map((m) => {
      const price = Number(m.price || 0);
      const cost = Number(m.calculatedCost ?? 0);
      return price > 0 ? ((price - cost) / price) * 100 : 0;
    });

    const avgMargin = margins.reduce((a, b) => a + b, 0) / Math.max(1, margins.length);
    return { total, avgMargin, inactive };
  }, [items, statsData]);

  const invalidateMenus = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["menus"] });
    queryClient.invalidateQueries({ queryKey: ["menuStats"] });
  }, [queryClient]);

  // ✅ 메뉴 생성
  const handleCreate = async (values: MenuFormValues) => {
    if (!values.menuName.trim() || values.price === "") return alert("입력 확인 필요");
    try {
      await menuApi.createMenu({
        storeId: currentStoreId!,
        menuName: values.menuName,
        price: Number(values.price),

        // ✅ 카테고리 포함
        categoryName: values.categoryName,
        subCategoryName: values.subCategoryName,
      });
      setIsAddModalOpen(false);
      pagination.resetPage();
      invalidateMenus();
    } catch (e: any) {
      alert(e.response?.data?.message || "오류");
    }
  };

  // ✅ 메뉴 수정
  const handleUpdate = async (values: MenuFormValues) => {
    if (!editingMenu) return;
    try {
      await menuApi.updateMenu(editingMenu.menuId, {
        storeId: currentStoreId!,
        menuName: values.menuName,
        price: Number(values.price),

        // ✅ 카테고리 포함
        categoryName: values.categoryName,
        subCategoryName: values.subCategoryName,
      });
      setIsEditModalOpen(false);
      invalidateMenus();
    } catch (e: any) {
      alert(e.response?.data?.message || "오류");
    }
  };

  const toggleStatus = async (row: MenuItem) => {
    const isActive = row.status === "ACTIVE";
    if (!confirm(isActive ? "비활성화?" : "활성화?")) return;
    try {
      isActive
        ? await menuApi.deactivateMenu(row.menuId, currentStoreId!)
        : await menuApi.reactivateMenu(row.menuId, currentStoreId!);
      invalidateMenus();
    } catch {
      alert("상태 변경 실패");
    }
  };

  const handleRecipeUpdated = (menuId: number, list: RecipeIngredient[]) => {
    setRecipeMap((prev) => ({ ...prev, [menuId]: list }));
    invalidateMenus();
  };

  const goToPage = (p: number) => {
    if (menuPage && p >= 0 && p < totalPages) pagination.handlePageChange(p);
  };

  return {
    items,
    loading,
    error: error ? (error as Error).message : null,
    calculatedCostMap,
    stats,

    searchQuery: search.keyword,
    setSearchQuery: search.handleChange,
    handleKeyDown: search.handleKeyDown,

    page: pagination.page,
    pageSize: pagination.size,
    setPageSize: pagination.handleSizeChange,
    totalPages,
    goToPage,

    showInactiveOnly,
    setShowInactiveOnly,
    invOptions,
    recipeMap,
    onRecipeUpdated: handleRecipeUpdated,

    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    editingMenu,

    openAddModal: () => {
      setEditingMenu(null);
      setIsAddModalOpen(true);
    },

    // ✅ [수정] edit 모달 열 때 단건조회로 카테고리까지 포함된 상세 데이터 세팅
    // ✅ [수정] edit 모달 열 때: detail 먼저 받고 -> editingMenu 세팅 -> 모달 open
    openEditModal: (row: MenuItem) => {
      (async () => {
        try {
          const detail = await menuApi.fetchMenu(row.menuId, currentStoreId!);
          setEditingMenu(detail);
        } catch {
          setEditingMenu(row);
        } finally {
          setIsEditModalOpen(true);
        }
      })();
    },

    handleCreate,
    handleUpdate,
    toggleStatus,

    isRecipeModalOpen,
    setIsRecipeModalOpen,
    selectedMenuForRecipe,
    openRecipeModal: (row: MenuItem) => {
      setSelectedMenuForRecipe(row);
      setIsRecipeModalOpen(true);
    },
  };
}