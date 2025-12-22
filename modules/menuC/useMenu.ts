// modules/menuC/useMenu.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/contexts/StoreContext";
import { menuApi } from "./menuApi";
import type { 
  ActiveStatus, 
  MenuItem, 
  InventoryItem, 
  RecipeIngredient 
} from "./menuTypes";

export type MenuFormValues = {
  menuName: string;
  price: number | "";
};

export function useMenu() {
  const { currentStoreId } = useStore();
  const queryClient = useQueryClient();

  // 검색/필터
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);

  // 페이지네이션 (1페이지 6개)
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(6);

  // 인벤토리 & 레시피 상태
  const [invOptions, setInvOptions] = useState<InventoryItem[]>([]);
  const [recipeMap, setRecipeMap] = useState<Record<number, RecipeIngredient[]>>({});

  // 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);

  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedMenuForRecipe, setSelectedMenuForRecipe] = useState<MenuItem | null>(null);

  // 1. 인벤토리 로드
  useEffect(() => {
    if (!currentStoreId) return;
    menuApi.fetchInventory(currentStoreId).then(setInvOptions).catch(() => setInvOptions([]));
  }, [currentStoreId]);

  // 2. 메뉴 목록 쿼리
  const status: ActiveStatus | undefined = showInactiveOnly ? "INACTIVE" : "ACTIVE";
  
  const { data: menuPage, isLoading: loading, error } = useQuery({
    queryKey: ["menus", currentStoreId, searchQuery, status, page, pageSize],
    queryFn: () => menuApi.fetchMenus({
      storeId: currentStoreId!,
      q: searchQuery || undefined,
      status,
      page,
      size: pageSize,
      sort: "menuName,asc",
    }),
    enabled: !!currentStoreId,
  });

  const items = menuPage?.content ?? [];
  const totalPages = menuPage?.totalPages ?? 0;

  // 3. 통계 쿼리
  const { data: statsData } = useQuery({
    queryKey: ["menuStats", currentStoreId],
    queryFn: () => menuApi.fetchMenuStats(currentStoreId!),
    enabled: !!currentStoreId,
  });

  // 4. 원가/마진 계산 (클라이언트 사이드)
  const calculatedCostMap = useMemo(() => {
    const map: Record<number, number> = {};
    for (const m of items) map[m.menuId] = Number(m.calculatedCost ?? 0);
    return map;
  }, [items]);

  const stats = useMemo(() => {
    const total = statsData?.totalMenus ?? 0;
    const inactive = statsData?.inactiveMenus ?? 0;
    if (!items.length) return { total, avgMargin: 0, inactive };

    const margins = items.map(m => {
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

  // 핸들러
  const handleCreate = async (values: MenuFormValues) => {
    if (!values.menuName.trim() || values.price === "" || isNaN(Number(values.price))) {
      return alert("메뉴명과 판매가를 올바르게 입력하세요.");
    }
    try {
      await menuApi.createMenu({
        storeId: currentStoreId!,
        menuName: values.menuName.trim(),
        price: Number(values.price),
      });
      setIsAddModalOpen(false);
      setPage(0);
      invalidateMenus();
    } catch (e: any) {
      alert(e.response?.data?.message || "생성 중 오류 발생");
    }
  };

  const handleUpdate = async (values: MenuFormValues) => {
    if (!editingMenu) return;
    if (!values.menuName.trim() || values.price === "" || isNaN(Number(values.price))) {
      return alert("메뉴명과 판매가를 올바르게 입력하세요.");
    }
    try {
      await menuApi.updateMenu(editingMenu.menuId, {
        storeId: currentStoreId!,
        menuName: values.menuName.trim(),
        price: Number(values.price),
      });
      setIsEditModalOpen(false);
      setEditingMenu(null);
      invalidateMenus();
    } catch (e: any) {
      alert(e.response?.data?.message || "수정 중 오류 발생");
    }
  };

  const toggleStatus = async (row: MenuItem) => {
    const isActive = row.status === "ACTIVE";
    if (!confirm(isActive ? "비활성화하시겠습니까?" : "활성화하시겠습니까?")) return;
    try {
      if (isActive) await menuApi.deactivateMenu(row.menuId, currentStoreId!);
      else await menuApi.reactivateMenu(row.menuId, currentStoreId!);
      invalidateMenus();
    } catch (e: any) {
      alert(e.response?.data?.message || "상태 변경 실패");
    }
  };

  const handleRecipeUpdated = (menuId: number, list: RecipeIngredient[]) => {
    setRecipeMap(prev => ({ ...prev, [menuId]: list }));
    invalidateMenus();
  };

  const goToPage = (p: number) => {
    if (menuPage && p >= 0 && p < totalPages) setPage(p);
  };

  return {
    items, loading, error: error ? (error as Error).message : null,
    calculatedCostMap, stats,
    searchQuery, setSearchQuery, showInactiveOnly, setShowInactiveOnly,
    page, pageSize, setPageSize, totalPages, goToPage,
    invOptions, recipeMap, onRecipeUpdated: handleRecipeUpdated,
    isAddModalOpen, setIsAddModalOpen,
    isEditModalOpen, setIsEditModalOpen,
    editingMenu,
    openAddModal: () => { setEditingMenu(null); setIsEditModalOpen(false); setIsAddModalOpen(true); },
    openEditModal: (row: MenuItem) => { setEditingMenu(row); setIsAddModalOpen(false); setIsEditModalOpen(true); },
    handleCreate, handleUpdate, toggleStatus,
    isRecipeModalOpen, setIsRecipeModalOpen,
    selectedMenuForRecipe,
    openRecipeModal: (row: MenuItem) => { setSelectedMenuForRecipe(row); setIsRecipeModalOpen(true); },
  };
}