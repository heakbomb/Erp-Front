// features/purchases/purchasesService.ts
import { apiClient } from "@/lib/api/client";
import type { PageResponse } from "@/lib/types/api";
import type { Inventory, PurchaseHistory } from "@/lib/types/database";
import { INGREDIENT_CATEGORIES } from "@/features/inventory/constants/itemCategory";

// == 1. 타입 정의 ==

// PurchaseHistory는 database.ts에 있지만, API 응답에 맞게 확장
export type PurchaseHistoryResponse = PurchaseHistory & {
  // (필요시 API DTO에만 있는 추가 필드 정의)
};

// 재고 목록 조회 API의 응답 (Inventory는 database.ts 타입 사용)
// ⭐️ 원가 계산을 위해 DTO에 avgUnitCost, lastUnitCost가 포함되어야 함
export type InventoryOption = Inventory & {
  avgUnitCost?: number;
  lastUnitCost?: number;
};

export type IngredientCategoryCode =
  (typeof INGREDIENT_CATEGORIES)[number]["value"]

// == 2. API 함수 ==

/**
 * (사장) 매입 내역 조회 (페이징, 필터링)
 * GET /owner/purchases
 */
type GetPurchasesParams = {
  storeId: number;
  page: number;
  size: number;
  sort: string;
  itemId?: number;
  from?: string; // startDate
  to?: string;   // endDate
};
export const getPurchases = async (params: GetPurchasesParams) => {
  const { storeId, ...rest } = params;
  // ⭐️ 참고: 실제 백엔드 API 경로가 /owner/purchases/store/{storeId} 일 수 있음
  const res = await apiClient.get<PageResponse<PurchaseHistoryResponse>>(
    `/owner/purchases`,
    { params: { storeId, ...rest } } // storeId를 쿼리 파라미터로 전송
  );
  return res.data;
};

/**
 * (사장) 재고 옵션 목록 조회 (매입 등록 모달용)
 * GET /owner/inventory
 */
export const getInventoryForOptions = async (storeId: number) => {
  const res = await apiClient.get<PageResponse<InventoryOption>>(
    `/owner/inventory`,
    {
      params: { storeId, page: 0, size: 1000, sort: "itemName,asc" },
    }
  );
  return res.data.content ?? [];
};

/**
 * (사장) 신규 매입 기록 생성
 * POST /owner/purchases
 */
type CreatePurchaseBody = {
  storeId: number;
  itemId: number;
  purchaseQty: number;
  unitPrice: number;
  purchaseDate: string; // "YYYY-MM-DD"
};

type UpdatePurchaseBody = {
  storeId: number;
  purchaseQty?: number;
  unitPrice?: number;
  purchaseDate?: string;
};

export const createPurchase = async (body: CreatePurchaseBody) => {
  const res = await apiClient.post<PurchaseHistoryResponse>(
    `/owner/purchases`,
    body
  );
  return res.data;
};

/**
 * (사장) 신규 재고 품목 생성 (매입 등록 모달에서)
 * POST /owner/inventory
 */
export type CreateInventoryBody = {
  storeId: number;
  itemName: string;          // 새 품목명
  itemType: string;          // "VEGETABLE" 같은 enum 코드 문자열
  stockType: string;         // 단위 (kg / L / ea 등)
  stockQty?: number;         // 초기 수량 (없으면 0)
  safetyQty?: number;        // 없으면 0
  status?: string;           // 없으면 "ACTIVE"
};

export async function createInventory(
  body: CreateInventoryBody
): Promise<InventoryOption> {
  const payload = {
    storeId: body.storeId,
    itemName: body.itemName,
    itemType: body.itemType,          // 백엔드 enum으로 매핑됨
    stockType: body.stockType,
    stockQty: body.stockQty ?? 0,
    safetyQty: body.safetyQty ?? 0,
    status: body.status ?? "ACTIVE",
  };

  const res = await apiClient.post<InventoryOption>(
    "/owner/inventory",
    payload
  );
  return res.data;
}
export const updatePurchase = async (purchaseId: number, body: UpdatePurchaseBody) => {
  const res = await apiClient.patch<PurchaseHistoryResponse>(
    `/owner/purchases/${purchaseId}`,
    body
  );
  return res.data;
};

/**
 * (사장) 매입 내역 삭제
 * DELETE /owner/purchases/{purchaseId}
 */
export const deletePurchase = async (purchaseId: number) => {
  await apiClient.delete(`/owner/purchases/${purchaseId}`);
};