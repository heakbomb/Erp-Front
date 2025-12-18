// modules/purchasesC/purchasesApi.ts
import { apiClient } from "@/shared/api/apiClient";
import type { PageResponse } from "@/shared/types/api";
import type { 
  PurchaseHistoryResponse, 
  InventoryOption, 
  CreatePurchaseBody, 
  UpdatePurchaseBody,
  CreateInventoryBody,
  PurchaseParams 
} from "./purchasesTypes";

export const purchasesApi = {
  // 매입 목록 조회
  getPurchases: async (params: PurchaseParams) => {
    // features: GET /owner/purchases
    const { storeId, ...rest } = params;
    const res = await apiClient.get<PageResponse<PurchaseHistoryResponse>>(`/owner/purchases`, {
      params: { storeId, ...rest },
    });
    return res.data;
  },

  // 재고 옵션 조회
  getInventoryForOptions: async (storeId: number) => {
    // features: GET /owner/inventory (dropdown용)
    const res = await apiClient.get<PageResponse<InventoryOption>>(`/owner/inventory`, {
      params: { storeId, page: 0, size: 1000, sort: "itemName,asc" },
    });
    return res.data.content ?? [];
  },

  // 매입 등록
  createPurchase: async (body: CreatePurchaseBody) => {
    const res = await apiClient.post<PurchaseHistoryResponse>(`/owner/purchases`, body);
    return res.data;
  },

  // 매입 수정
  updatePurchase: async (purchaseId: number, body: UpdatePurchaseBody) => {
    const res = await apiClient.patch<PurchaseHistoryResponse>(`/owner/purchases/${purchaseId}`, body);
    return res.data;
  },

  // 매입 삭제
  deletePurchase: async (purchaseId: number) => {
    await apiClient.delete(`/owner/purchases/${purchaseId}`);
  },

  // 새 품목 생성 (모달 내부용)
  createInventory: async (body: CreateInventoryBody) => {
    const res = await apiClient.post<InventoryOption>("/owner/inventory", body);
    return res.data;
  },
};