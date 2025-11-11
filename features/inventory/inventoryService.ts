// features/inventory/inventoryService.ts

import { apiClient } from "../../lib/api/client"; // ⭐️ 경로 수정
import type { Inventory } from "../../lib/types/database"; // ⭐️ 경로 수정
import type { PageResponse } from "../../lib/types/api"; // ⭐️ 경로 수정

type InventoryParams = {
  storeId: number;
  q: string;
  page: number;
  size: number;
  sort?: string;
};

/**
 * 재고 목록 조회 (페이징)
 */
export const getInventory = async (params: InventoryParams) => {
  // ⭐️ 백엔드 컨트롤러가 "/owner/inventory"를 사용하므로 경로 유지
  const res = await apiClient.get<PageResponse<Inventory>>(
    "/owner/inventory", 
    { params }
  );
  return res.data;
};

// ... (이하 createInventory, updateInventory, deleteInventory 함수들은
//     경로 수정 없이 그대로 사용합니다.)

type InventoryCreateBody = {
  storeId: number;
  itemName: string;
  itemType: string;
  stockType: string;
  stockQty: number;
  safetyQty: number;
};

export const createInventory = async (body: InventoryCreateBody) => {
  const res = await apiClient.post<Inventory>("/owner/inventory", body);
  return res.data;
};

export const updateInventory = async (itemId: number, body: InventoryCreateBody) => {
  const res = await apiClient.patch<Inventory>(`/owner/inventory/${itemId}`, body);
  return res.data;
};

export const deleteInventory = async (itemId: number) => {
  await apiClient.delete(`/owner/inventory/${itemId}`);
};