// features/menu/menuService.ts

// paths updated from:
// "./client" -> "../../../lib/api/client"
// "../types/api" -> "../../../lib/types/api"
// "../types/database" -> "../../../lib/types/database"

import { apiClient } from "../../lib/api/client";
import type { PageResponse as ApiPageResponse } from "../../lib/types/api"; 
import type {
  MenuItem,
  RecipeIngredient,
  Inventory,
} from "../../lib/types/database";

/**
 * 메뉴 목록 조회 (페이징)
 */
export const getMenus = async (params: {
  storeId: number;
  q: string;
  page: number;
  size: number;
  sort?: string;
}) => {
  const res = await apiClient.get<ApiPageResponse<MenuItem>>(
    "/owner/menu",
    { params }
  );
  return res.data;
};

// ... (MenuCreateBody 타입 정의)
type MenuCreateBody = {
  storeId: number;
  menuName: string;
  price: number;
};

// ... (createMenu, updateMenu, deleteMenu 함수는 동일)
// (내부 로직은 변경 없음)
export const createMenu = async (body: MenuCreateBody) => { 
  const res = await apiClient.post<MenuItem>("/owner/menu", body);
  return res.data;
};
export const updateMenu = async (menuId: number, body: MenuCreateBody) => { 
  const res = await apiClient.patch<MenuItem>(`/owner/menu/${menuId}`, body);
  return res.data;
};
export const deleteMenu = async (menuId: number) => { 
  await apiClient.delete(`/owner/menu/${menuId}`);
};


/**
 * 메뉴의 레시피 목록 조회
 */
export const getRecipeIngredients = async (menuId: number) => {
  const res = await apiClient.get<RecipeIngredient[]>(
    `/owner/menu/${menuId}/recipeIngredients`
  );
  return res.data;
};

// ... (RecipeCreateBody 타입 정의)
type RecipeCreateBody = {
  menuId: number;
  itemId: number;
  consumptionQty: number;
};

// ... (addRecipeIngredient, updateRecipeIngredient, deleteRecipeIngredient 함수는 동일)
// (내부 로직은 변경 없음)
export const addRecipeIngredient = async (menuId: number, body: RecipeCreateBody) => { 
  const res = await apiClient.post<RecipeIngredient>(`/owner/menu/${menuId}/recipeIngredients`, body);
  return res.data;
};
export const updateRecipeIngredient = async (recipeId: number, body: { consumptionQty: number }) => { 
  const res = await apiClient.patch<RecipeIngredient>(`/owner/menu/recipeIngredients/${recipeId}`, body);
  return res.data;
};
export const deleteRecipeIngredient = async (recipeId: number) => { 
  await apiClient.delete(`/owner/menu/recipeIngredients/${recipeId}`);
};


/**
 * (Helper) 레시피 추가 모달용 재고 목록 조회
 */
export const getInventoryOptionsForMenu = async (storeId: number) => {
  const res = await apiClient.get<ApiPageResponse<Inventory>>(
    "/owner/inventory",
    {
      params: { storeId, page: 0, size: 1000, sort: "itemName,asc" },
    }
  );
  return res.data;
};