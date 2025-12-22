// modules/inventoryC/inventoryTypes.ts

// features/inventory/constants/itemCategory.ts 내용 포함
export const INGREDIENT_CATEGORIES = [
  { value: "VEGETABLE", label: "농산물" },
  { value: "MEAT", label: "축산물" },
  { value: "SEAFOOD", label: "수산물" },
  { value: "SEASONING", label: "조미료/양념" },
  { value: "GRAIN", label: "곡류/전분" },
  { value: "PROCESSED_FOOD", label: "면/가공식품" },
  { value: "CANNED", label: "통조림/절임" },
  { value: "BAKERY", label: "베이커리/파티쉐" },
  { value: "CAFE", label: "카페 재료" },
  { value: "BEVERAGE_BASE", label: "음료 베이스" },
  { value: "FROZEN", label: "냉동/신선" },
  { value: "ETC", label: "기타" },
] as const;

export type InventoryStatus = "ACTIVE" | "INACTIVE";

// 백엔드 엔티티 (features 기준)
export interface Inventory {
  itemId: number;
  storeId: number;
  itemName: string;
  itemType: string;  // CATEGORY value
  stockType: string; // 단위
  stockQty: number;
  safetyQty: number;
  status?: InventoryStatus; // DTO에 포함될 수 있음
  // lastUnitCost는 features에 명시적으로 보이지 않지만, 필요시 유지. features 기준으로는 일단 제외되어 있음.
}

// 목록 조회 파라미터
export interface InventoryParams {
  storeId: number;
  q: string;
  page: number;
  size: number;
  sort?: string;
  status: InventoryStatus;
  itemType?: string;
}

// 생성/수정 바디
export interface InventoryUpsertBody {
  storeId: number; // patch 시에도 필요함 (features 로직)
  itemName: string;
  itemType: string;
  stockType: string;
  stockQty: number;
  safetyQty: number;
}