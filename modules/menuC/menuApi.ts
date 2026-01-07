// modules/menuC/menuApi.ts
import { apiClient } from "@/shared/api/apiClient";
import type { PageResponse } from "@/shared/types/api";
import type {
  MenuItem,
  InventoryItem,
  RecipeIngredient,
  MenuStats,
  MenuListParams,
  MenuUpsertRequest,
  AddRecipeRequest,
  UpdateRecipeRequest
} from "./menuTypes";

export const menuApi = {
  // 메뉴 목록 조회
  fetchMenus: async (params: MenuListParams) => {
    const res = await apiClient.get<PageResponse<MenuItem>>(`/owner/menu`, { params });
    return res.data;
  },

  // 메뉴 생성
  createMenu: async (body: MenuUpsertRequest) => {
    const res = await apiClient.post<MenuItem>(`/owner/menu`, body);
    return res.data;
  },

  // 메뉴 수정
  updateMenu: async (menuId: number, body: MenuUpsertRequest) => {
    const res = await apiClient.patch<MenuItem>(`/owner/menu/${menuId}`, body, {
      params: { storeId: body.storeId },
    });
    return res.data;
  },

  // 메뉴 비활성화
  deactivateMenu: async (menuId: number, storeId: number) => {
    await apiClient.post(`/owner/menu/${menuId}/deactivate`, null, {
      params: { storeId }
    });
  },

  // 메뉴 활성화
  reactivateMenu: async (menuId: number, storeId: number) => {
    await apiClient.post(`/owner/menu/${menuId}/reactivate`, null, {
      params: { storeId }
    });
  },

  // 인벤토리 조회 (레시피 등록용)
  fetchInventory: async (storeId: number) => {
    const res = await apiClient.get<PageResponse<InventoryItem>>(`/owner/inventory`, {
      params: { storeId, page: 0, size: 1000, sort: "itemName,asc" },
    });
    return res.data.content ?? [];
  },

  // 레시피 재료 조회
  fetchRecipeIngredients: async (menuId: number) => {
    const res = await apiClient.get<RecipeIngredient[]>(`/owner/menu/${menuId}/recipeIngredients`);
    return Array.isArray(res.data) ? res.data : [];
  },

  // 레시피 재료 추가
  addRecipeIngredient: async (menuId: number, body: AddRecipeRequest) => {
    const res = await apiClient.post<RecipeIngredient>(`/owner/menu/${menuId}/recipeIngredients`, body);
    return res.data;
  },

  // 레시피 재료 수정
  updateRecipeIngredient: async (recipeId: number, body: UpdateRecipeRequest) => {
    const res = await apiClient.patch<RecipeIngredient>(`/owner/menu/recipeIngredients/${recipeId}`, body);
    return res.data;
  },

  // 레시피 재료 삭제
  deleteRecipeIngredient: async (recipeId: number) => {
    await apiClient.delete(`/owner/menu/recipeIngredients/${recipeId}`);
  },

  // 메뉴 통계 조회
  fetchMenuStats: async (storeId: number) => {
    const res = await apiClient.get<MenuStats>("/owner/menu/stats", {
      params: { storeId },
    });
    return res.data;
  },

  // ✅ [추가] 중분류 목록
  fetchMenuCategories: async (industry: "KOREAN" | "CHICKEN") => {
    const res = await apiClient.get<string[]>(`/owner/menu/categories`, {
      params: { industry },
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  // ✅ [추가] 소분류 목록
  fetchMenuSubCategories: async (
    industry: "KOREAN" | "CHICKEN",
    categoryName: string
  ) => {
    const res = await apiClient.get<string[]>(`/owner/menu/categories/sub`, {
      params: { industry, categoryName },
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  // ✅ [추가] 메뉴 단건 조회 (수정 모달 기본값 세팅용)
  fetchMenu: async (menuId: number, storeId: number) => {
    const res = await apiClient.get<MenuItem>(`/owner/menu/${menuId}`, {
      params: { storeId },
    });
    return res.data;
  },
};