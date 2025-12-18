// modules/menuC/menuTypes.ts

export type ActiveStatus = "ACTIVE" | "INACTIVE";

export interface MenuItem {
  menuId: number;
  storeId: number;
  menuName: string;
  price: number;
  calculatedCost?: number; // 레시피 기반 산출 원가
  status: ActiveStatus;
}

export interface InventoryItem {
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
}

export interface RecipeIngredient {
  recipeId: number;
  menuId: number;
  itemId: number;
  consumptionQty: number;
}

export interface MenuStats {
  totalMenus: number;
  inactiveMenus: number;
}

// 검색 파라미터
export interface MenuListParams {
  storeId: number;
  q?: string;
  status?: ActiveStatus;
  page?: number;
  size?: number;
  sort?: string;
}

// 생성/수정 요청 DTO
export interface MenuUpsertRequest {
  storeId: number;
  menuName: string;
  price: number;
}

// 레시피 추가 요청 DTO
export interface AddRecipeRequest {
  menuId: number;
  itemId: number;
  consumptionQty: number;
}

// 레시피 수정 요청 DTO
export interface UpdateRecipeRequest {
  consumptionQty: number;
}