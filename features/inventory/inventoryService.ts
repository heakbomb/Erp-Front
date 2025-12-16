// features/inventory/inventoryService.ts
import { apiClient } from "@/shared/api/apiClient";
import type { Inventory } from "@/shared/types/database";
import type { PageResponse } from "@/shared/types/api";

// 1. 'status' 파라미터 추가
type InventoryParams = {
  storeId: number;
  q: string;
  page: number;
  itemType?: string
  size: number;
  sort?: string;
  status: "ACTIVE" | "INACTIVE"; // 'ACTIVE' 또는 'INACTIVE'
};

/**
 * 재고 목록 조회 (페이징)
 */
export const getInventory = async (params: InventoryParams) => {
  // 'status'가 params에 포함되어 백엔드로 전달됨
  const res = await apiClient.get<PageResponse<Inventory>>(
    "/owner/inventory",
    { params }
  );
  return res.data;
};

// 2. 생성/수정용 DTO (기존 코드와 동일)
type InventoryUpsertBody = {
  storeId: number;
  itemName: string;
  itemType: string;
  stockType: string;
  stockQty: number;
  safetyQty: number;
};

export const createInventory = async (body: InventoryUpsertBody) => {
  const res = await apiClient.post<Inventory>("/owner/inventory", body);
  return res.data;
};

export const updateInventory = async (itemId: number, body: InventoryUpsertBody) => {
  const res = await apiClient.patch<Inventory>(`/owner/inventory/${itemId}`, body, {
    params: { storeId: body.storeId }, // ⭐️ patch 시 storeId 파라미터 추가
  });
  return res.data;
};

// 3. 'delete' 대신 'deactivate/reactivate' 함수로 교체
/**
 * 재고 비활성화
 */
export const deactivateInventory = async ({ itemId, storeId }: { itemId: number; storeId: number }) => {
  await apiClient.post(`/owner/inventory/${itemId}/deactivate`, null, {
    params: { storeId },
  });
};

/**
 * 재고 활성화
 */
export const reactivateInventory = async ({ itemId, storeId }: { itemId: number; storeId: number }) => {
  await apiClient.post(`/owner/inventory/${itemId}/reactivate`, null, {
    params: { storeId },
  });
};

export const downloadInventoryExcel = async (storeId: number) => {
  const res = await apiClient.get("/owner/inventory/export/excel", {
    params: { storeId },      
    responseType: "blob",     
  });

  return res.data as Blob;
};