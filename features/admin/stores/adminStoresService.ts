// features/admin/stores/adminStoresService.ts
import { apiClient } from "@/shared/api/apiClient";
import type { Store } from "@/shared/types/database"; // ⭐️ Store 타입 필요
import { PageResponse } from "@/shared/types/api";

type AdminGetStoresParams = {
  page: number;
  size: number;
  status: string; // ⭐️ "PENDING", "APPROVED", "REJECTED", "ALL" 등
  q: string; // 검색어
};

/**
 * (Admin) 사업장 목록 조회 (페이징, 상태 필터링)
 */
export const getStores = async (params: AdminGetStoresParams) => {
  const res = await apiClient.get<PageResponse<Store>>(
    "/admin/stores", // ⭐️ 관리자용 API 엔드포인트 (가정)
    { params }
  );
  return res.data;
};

type UpdateStoreStatusBody = {
  status: "APPROVED" | "REJECTED";
  // (필요시 반려 사유 등 추가)
  // reason?: string; 
};

/**
 * (Admin) 사업장 상태 변경 (승인/반려)
 */
export const updateStoreStatus = async (
  storeId: number, 
  body: UpdateStoreStatusBody
) => {
  const res = await apiClient.patch<Store>(
    `/admin/stores/${storeId}/status`, // ⭐️ 관리자용 API 엔드포인트 (가정)
    body
  );
  return res.data;
};