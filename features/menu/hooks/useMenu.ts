// features/menu/hooks/useMenu.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
// ⭐️ 1. API 서비스 함수들을 import
import {
  ActiveStatus,
  CostingMethod,
  MenuItemResponse,
  InventoryResponse,
  RecipeIngredientResponse,
  fetchInventory,
  fetchMenus,
  createMenu,
  updateMenu,
  deactivateMenu,
  reactivateMenu,
  fetchRecipeIngredients,
  STORE_ID, // ⭐️ (임시) StoreContext로 대체 필요
} from "../menuService";

export type MenuFormValues = {
  menuName: string;
  price: number | "";
};

// ⭐️ 2. 모든 로직을 useMenu 훅으로 캡슐화
export function useMenu() {
  // 메뉴 리스트/상태
  const [items, setItems] = useState<MenuItemResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 검색/필터
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);

  // 원가 계산 방식
  const [costingMethod, setCostingMethod] =
    useState<CostingMethod>("AVERAGE");

  // 인벤토리 & 레시피 맵
  const [invOptions, setInvOptions] = useState<InventoryResponse[]>([]);
  const [recipeMap, setRecipeMap] = useState<
    Record<number, RecipeIngredientResponse[]>
  >({});

  // 메뉴 추가/수정 모달
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] =
    useState<MenuItemResponse | null>(null);

  // 레시피 모달
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedMenuForRecipe, setSelectedMenuForRecipe] =
    useState<MenuItemResponse | null>(null);

  const page = 0;
  const size = 50;
  const sort = "menuName,asc";

  // ===== 인벤토리 로드 =====
  const loadInventory = useCallback(async () => {
    try {
      // ⭐️ 3. axios 대신 서비스 함수 호출
      const list = await fetchInventory(STORE_ID);
      setInvOptions(list);
    } catch {
      setInvOptions([]);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // ===== 메뉴 + 레시피 일괄 로드 =====
  const loadMenus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const status: ActiveStatus | undefined = showInactiveOnly
        ? "INACTIVE"
        : "ACTIVE";

      // ⭐️ 3. axios 대신 서비스 함수 호출
      const menuPage = await fetchMenus({
        storeId: STORE_ID,
        q: searchQuery || undefined,
        status,
        page,
        size,
        sort,
      });

      const list = menuPage.content ?? [];
      setItems(list);

      // 각 메뉴의 레시피를 병렬로 로드
      const entries = await Promise.all(
        list.map(async (m) => {
          try {
            // ⭐️ 3. axios 대신 서비스 함수 호출
            const arr = await fetchRecipeIngredients(m.menuId);
            return [m.menuId, arr] as const;
          } catch {
            return [m.menuId, [] as RecipeIngredientResponse[]] as const;
          }
        })
      );

      const newMap: Record<number, RecipeIngredientResponse[]> = {};
      for (const [menuId, arr] of entries) {
        newMap[menuId] = arr;
      }
      setRecipeMap(newMap);
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        "목록을 불러오는 중 오류가 발생했습니다.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, showInactiveOnly]);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  // ===== 프론트 계산용 원가 맵 =====
  const invCostMap = useMemo(() => {
    const m = new Map<
      number,
      { avg?: number; last?: number }
    >();
    for (const inv of invOptions) {
      m.set(inv.itemId, {
        avg: inv.avgUnitCost ?? 0,
        last: inv.lastUnitCost ?? 0,
      });
    }
    return m;
  }, [invOptions]);

  const calculatedCostMap = useMemo(() => {
    const map: Record<number, number> = {};
    for (const menu of items) {
      const recipe = recipeMap[menu.menuId] || [];
      let sum = 0;
      for (const ri of recipe) {
        const c = invCostMap.get(ri.itemId);
        const unit =
          costingMethod === "AVERAGE"
            ? c?.avg ?? 0
            : c?.last ?? 0;
        sum +=
          Number(ri.consumptionQty) * Number(unit || 0);
      }
      map[menu.menuId] = +sum.toFixed(2); // 소수 2자리
    }
    return map;
  }, [items, recipeMap, invCostMap, costingMethod]);

  // ===== 통계 =====
  const stats = useMemo(() => {
    if (!items.length)
      return { total: 0, avgMargin: 0, inactive: 0 };

    const margins = items.map((m) => {
      const price = Number(m.price || 0);
      const cost = calculatedCostMap[m.menuId] ?? 0;
      if (price <= 0) return 0;
      return ((price - cost) / price) * 100;
    });

    return {
      total: items.length,
      avgMargin:
        margins.reduce((a, b) => a + b, 0) /
        Math.max(1, margins.length),
      inactive: items.filter(
        (i) => i.status === "INACTIVE"
      ).length,
    };
  }, [items, calculatedCostMap]);

  // ===== 메뉴 생성/수정 =====
  const handleCreate = async (values: MenuFormValues) => {
    if (
      !values.menuName.trim() ||
      values.price === "" ||
      isNaN(Number(values.price))
    ) {
      alert("메뉴명과 판매가를 올바르게 입력하세요.");
      return;
    }
    try {
      // ⭐️ 3. axios 대신 서비스 함수 호출
      await createMenu({
        storeId: STORE_ID,
        menuName: values.menuName.trim(),
        price: Number(values.price),
      });
      setIsAddModalOpen(false);
      await loadMenus(); // ⭐️ 목록 새로고침
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
      alert(
        [msg, hint].filter(Boolean).join("\n")
      );
    }
  };

  const handleUpdate = async (
    values: MenuFormValues
  ) => {
    if (!editingMenu) return;
    if (
      !values.menuName.trim() ||
      values.price === "" ||
      isNaN(Number(values.price))
    ) {
      alert("메뉴명과 판매가를 올바르게 입력하세요.");
      return;
    }
    try {
      // ⭐️ 3. axios 대신 서비스 함수 호출
      await updateMenu(editingMenu.menuId, {
        storeId: STORE_ID,
        menuName: values.menuName.trim(),
        price: Number(values.price),
      });
      setIsEditModalOpen(false);
      setEditingMenu(null);
      await loadMenus(); // ⭐️ 목록 새로고침
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
      alert(
        [msg, hint].filter(Boolean).join("\n")
      );
    }
  };

  // ===== 메뉴 상태 토글 =====
  const toggleStatus = async (row: MenuItemResponse) => {
    const isActive = row.status === "ACTIVE";
    const ok = window.confirm(
      isActive
        ? "이 메뉴를 비활성화할까요?"
        : "이 메뉴를 활성화할까요?"
    );
    if (!ok) return;

    try {
      // ⭐️ 3. axios 대신 서비스 함수 호출
      if (isActive) {
        await deactivateMenu(row.menuId, STORE_ID);
      } else {
        await reactivateMenu(row.menuId, STORE_ID);
      }
      await loadMenus(); // ⭐️ 목록 새로고침
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
      alert(
        [msg, hint].filter(Boolean).join("\n")
      );
    }
  };

  // ===== 모달 오픈 헬퍼 =====
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

  // 레시피 갱신 시 부모의 recipeMap도 갱신
  const handleRecipeUpdated = (
    menuId: number,
    list: RecipeIngredientResponse[]
  ) => {
    setRecipeMap((prev) => ({
      ...prev,
      [menuId]: list,
    }));
  };

  // ⭐️ 4. UI 컴포넌트에 필요한 모든 값을 반환
  return {
    // 데이터
    items,
    loading,
    error,
    calculatedCostMap,
    stats,

    // 검색/필터/원가
    searchQuery,
    setSearchQuery,
    showInactiveOnly,
    setShowInactiveOnly,
    costingMethod,
    setCostingMethod,

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