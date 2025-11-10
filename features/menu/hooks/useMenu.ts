// features/menu/useMenu.ts
"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// paths updated from:
// "@/contexts/StoreContext" -> "../../contexts/StoreContext"
// "@/lib/api/menu.service" -> "./menuService"
// "@/lib/types/database" -> "../../lib/types/database"

import { useStore } from "../../../contexts/StoreContext"; 
import {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
} from "../menuService"; 
import type { MenuItem } from "../../../lib/types/database";

// ... (내부 로직은 변경 없음)
export type MenuFormValues = {
  menuName: string;
  price: number | "";
};

export function useMenu() {
  const { currentStoreId } = useStore();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("menuName,asc");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);

  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedMenuForRecipe, setSelectedMenuForRecipe] = useState<MenuItem | null>(null);

  const queryParams = {
    storeId: currentStoreId!,
    q: searchQuery,
    page,
    size: pageSize,
    sort,
  };

  const {
    data: menuData,
    isLoading: isMenusLoading,
    error: menusError,
  } = useQuery({
    queryKey: ["menus", queryParams],
    queryFn: () => getMenus(queryParams),
    enabled: !!currentStoreId,
  });

  const menuStats = useMemo(() => {
    const items = menuData?.content ?? [];
    if (!items.length) return { total: 0, avgMargin: 0 };
    const margins = items.map((m) => {
      const price = Number(m.price || 0);
      const cost = Number(m.calculatedCost || 0);
      if (price <= 0) return 0;
      return ((price - cost) / price) * 100;
    });
    return {
      total: items.length,
      avgMargin: margins.reduce((a, b) => a + b, 0) / (margins.length || 1),
    };
  }, [menuData]);

  const createMutation = useMutation({
    mutationFn: createMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setIsAddModalOpen(false);
    },
    onError: (error) => alert(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ menuId, body }: { menuId: number; body: MenuFormValues }) =>
      updateMenu(menuId, { ...body, storeId: currentStoreId!, price: Number(body.price) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setIsEditModalOpen(false);
      setEditingMenu(null);
    },
    onError: (error) => alert(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
    onError: (error) => alert(error.message),
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(0);
  };

  const handleCreate = (values: MenuFormValues) => {
    createMutation.mutate({
      ...values,
      storeId: currentStoreId!,
      price: Number(values.price),
    });
  };

  const handleUpdate = (values: MenuFormValues) => {
    if (!editingMenu) return;
    updateMutation.mutate({ menuId: editingMenu.menuId, body: values });
  };

  const handleDelete = (menuId: number) => {
    if (confirm("정말 삭제하시겠어요?")) {
      deleteMutation.mutate(menuId);
    }
  };

  const openAddModal = () => setIsAddModalOpen(true);
  
  const openEditModal = (menu: MenuItem) => {
    setEditingMenu(menu);
    setIsEditModalOpen(true);
  };
  
  const openRecipeModal = (menu: MenuItem) => {
    setSelectedMenuForRecipe(menu);
    setIsRecipeModalOpen(true);
  };

  return {
    menuData,
    isMenusLoading,
    menusError,
    menuStats,
    page,
    setPage,
    searchQuery,
    handleSearch,
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    editingMenu,
    handleCreate,
    handleUpdate,
    openAddModal,
    openEditModal,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    handleDelete,
    isRecipeModalOpen,
    setIsRecipeModalOpen,
    selectedMenuForRecipe,
    openRecipeModal,
  };
}