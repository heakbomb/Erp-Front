// features/menu/menuService.ts
"use client";

import { apiClient } from "@/lib/api/client"; // ✅ apiClient 사용

export const STORE_ID = 11; // ⭐️ (임시) StoreContext로 대체 필요

export type ActiveStatus = "ACTIVE" | "INACTIVE";
export type CostingMethod = "AVERAGE" | "LAST";

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export type MenuItemResponse = {
  menuId: number;
  storeId: number;
  menuName: string;
  price: number;
  calculatedCost?: number;
  status: ActiveStatus;
};

export type RecipeIngredientResponse = {
  recipeId: number;
  menuId: number;
  itemId: number;
  consumptionQty: number;
};

export type InventoryResponse = {
  itemId: number;
  storeId: number;
  itemName: string;
  itemType: string;
  stockType: string;
  stockQty: number;
  safetyQty: number;
  status: ActiveStatus;
  avgUnitCost?: number;
  lastUnitCost?: number;
};

export type MenuStatsResponse = {
  totalMenus: number;
  inactiveMenus: number;
};

// ===== 메뉴 =====
type MenuListParams = {
  storeId: number;
  q?: string;
  status?: ActiveStatus;
  page?: number;
  size?: number;
  sort?: string;
};



export async function fetchMenus(params: MenuListParams) {
  const res = await apiClient.get<PageResponse<MenuItemResponse>>( // ✅ apiClient 사용
    `/owner/menu`,
    { params }
  );
  return res.data;
}

export async function createMenu(body: {
  storeId: number;
  menuName: string;
  price: number;
}) {
  const res = await apiClient.post<MenuItemResponse>( // ✅ apiClient 사용
    `/owner/menu`,
    body
  );
  return res.data;
}

export async function updateMenu(
  menuId: number,
  body: { storeId: number; menuName: string; price: number }
) {
  const res = await apiClient.patch<MenuItemResponse>( // ✅ apiClient 사용
    `/owner/menu/${menuId}`,
    body,
    {
      params: { storeId: body.storeId },
    }
  );
  return res.data;
}

export async function deactivateMenu(menuId: number, storeId: number) {
  await apiClient.post( // ✅ apiClient 사용
    `/owner/menu/${menuId}/deactivate`,
    null,
    { params: { storeId } }
  );
}

export async function reactivateMenu(menuId: number, storeId: number) {
  await apiClient.post( // ✅ apiClient 사용
    `/owner/menu/${menuId}/reactivate`,
    null,
    { params: { storeId } }
  );
}

// ===== 인벤토리(원가 포함) =====
export async function fetchInventory(storeId: number) {
  const res = await apiClient.get<PageResponse<InventoryResponse>>( // ✅ apiClient 사용
    `/owner/inventory`,
    {
      params: {
        storeId,
        page: 0,
        size: 1000,
        sort: "itemName,asc",
      },
    }
  );
  return res.data.content ?? [];
}

// ===== 레시피 =====
export async function fetchRecipeIngredients(menuId: number) {
  const res = await apiClient.get<RecipeIngredientResponse[]>( // ✅ apiClient 사용
    `/owner/menu/${menuId}/recipeIngredients`
  );
  return Array.isArray(res.data) ? res.data : [];
}

export async function addRecipeIngredient(
  menuId: number,
  body: { menuId: number; itemId: number; consumptionQty: number }
) {
  const res = await apiClient.post<RecipeIngredientResponse>( // ✅ apiClient 사용
    `/owner/menu/${menuId}/recipeIngredients`,
    body
  );
  return res.data;
}

export async function updateRecipeIngredient(
  recipeId: number,
  body: { consumptionQty: number }
) {
  const res = await apiClient.patch<RecipeIngredientResponse>( // ✅ apiClient 사용
    `/owner/menu/recipeIngredients/${recipeId}`,
    body
  );
  return res.data;
}

export async function deleteRecipeIngredient(recipeId: number) {
  await apiClient.delete( // ✅ apiClient 사용
    `/owner/menu/recipeIngredients/${recipeId}`
  );

}

export async function fetchMenuStats(storeId: number) {
  const res = await apiClient.get<MenuStatsResponse>(
    "/owner/menu/stats",
    { params: { storeId } }
  );
  return res.data;
}