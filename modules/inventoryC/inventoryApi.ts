// modules/inventoryC/inventoryApi.ts
import { apiClient } from "@/shared/api/apiClient";
import type { PageResponse } from "@/shared/types/api"; 
import type { 
  Inventory, 
  InventoryParams, 
  InventoryUpsertBody 
} from "./inventoryTypes";

export const inventoryApi = {
  // 재고 목록 조회
  getInventory: async (params: InventoryParams) => {
    const res = await apiClient.get<PageResponse<Inventory>>("/owner/inventory", {
      params,
    });
    return res.data;
  },

  // 생성
  createInventory: async (body: InventoryUpsertBody) => {
    const res = await apiClient.post<Inventory>("/owner/inventory", body);
    return res.data;
  },

  // 수정
  updateInventory: async (itemId: number, body: InventoryUpsertBody) => {
    // features: patch 사용, storeId 파라미터로 전달
    const res = await apiClient.patch<Inventory>(`/owner/inventory/${itemId}`, body, {
      params: { storeId: body.storeId },
    });
    return res.data;
  },

  // 비활성화
  deactivateInventory: async (itemId: number, storeId: number) => {
    await apiClient.post(`/owner/inventory/${itemId}/deactivate`, null, {
      params: { storeId },
    });
  },

  // 활성화
  reactivateInventory: async (itemId: number, storeId: number) => {
    await apiClient.post(`/owner/inventory/${itemId}/reactivate`, null, {
      params: { storeId },
    });
  },

  // 엑셀 다운로드
  downloadInventoryExcel: async (storeId: number) => {
    const res = await apiClient.get("/owner/inventory/export/excel", {
      params: { storeId },      
      responseType: "blob",     
    });
    return res.data as Blob;
  },
};