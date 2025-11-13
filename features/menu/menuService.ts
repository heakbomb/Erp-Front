// features/menu/menuService.ts
"use client";

import axios from "axios";

// ⭐️ (개선) apiClient를 사용하도록 수정할 수 있습니다.
export const API_BASE = "http://localhost:8080";
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
  const res = await axios.get<PageResponse<MenuItemResponse>>(
    `${API_BASE}/owner/menu`,
    { params }
  );
  return res.data;
}

export async function createMenu(body: {
  storeId: number;
  menuName: string;
  price: number;
}) {
  const res = await axios.post<MenuItemResponse>(
    `${API_BASE}/owner/menu`,
    body
  );
  return res.data;
}

export async function updateMenu(
  menuId: number,
  body: { storeId: number; menuName: string; price: number }
) {
  const res = await axios.patch<MenuItemResponse>(
    `${API_BASE}/owner/menu/${menuId}`,
    body,
    {
      params: { storeId: body.storeId },
    }
  );
  return res.data;
}

export async function deactivateMenu(menuId: number, storeId: number) {
  await axios.post(
    `${API_BASE}/owner/menu/${menuId}/deactivate`,
    null,
    { params: { storeId } }
  );
}

export async function reactivateMenu(menuId: number, storeId: number) {
  await axios.post(
    `${API_BASE}/owner/menu/${menuId}/reactivate`,
    null,
    { params: { storeId } }
  );
}

// ===== 인벤토리(원가 포함) =====
export async function fetchInventory(storeId: number) {
  const res = await axios.get<PageResponse<InventoryResponse>>(
    `${API_BASE}/owner/inventory`,
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
  const res = await axios.get<RecipeIngredientResponse[]>(
    `${API_BASE}/owner/menu/${menuId}/recipeIngredients`
  );
  return Array.isArray(res.data) ? res.data : [];
}

export async function addRecipeIngredient(
  menuId: number,
  body: { menuId: number; itemId: number; consumptionQty: number }
) {
  const res = await axios.post<RecipeIngredientResponse>(
    `${API_BASE}/owner/menu/${menuId}/recipeIngredients`,
    body
  );
  return res.data;
}

export async function updateRecipeIngredient(
  recipeId: number,
  body: { consumptionQty: number }
) {
  const res = await axios.patch<RecipeIngredientResponse>(
    `${API_BASE}/owner/menu/recipeIngredients/${recipeId}`,
    body
  );
  return res.data;
}

export async function deleteRecipeIngredient(recipeId: number) {
  await axios.delete(
    `${API_BASE}/owner/menu/recipeIngredients/${recipeId}`
  );
}