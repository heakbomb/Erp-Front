// modules/storeC/storeApi.ts
import { apiClient } from "@/shared/api/apiClient";
import type { PageResponse } from "@/shared/types/api";
import type {
  AdminGetStoresParams,
  AssignmentStatus,
  BusinessNumber,
  PhoneVerifyResponse,
  PhoneVerifyStatus,
  Store,
  StoreCreateRequest,
  StoreResponse,
  UpdateStoreStatusBody
} from "./storeTypes";

type StoreGpsResponse = {
  storeId: number;
  latitude: number;
  longitude: number;
  gpsRadiusM?: number | null;
};

export const storeApi = {
  /* --- 관리자 (Admin) 기능 --- */
  getStores: async (params: AdminGetStoresParams) => {
    const res = await apiClient.get<PageResponse<Store>>("/admin/stores", { params });
    return res.data;
  },

  // ✅ 이름 오타만 정리(기능 동일)
  updateStoreStatus: async (storeId: number, body: UpdateStoreStatusBody) => {
    const res = await apiClient.patch<Store>(`/admin/stores/${storeId}/status`, body);
    return res.data;
  },

  /* --- 사장님 (Owner) 기능 --- */
  fetchMyStores: async (ownerId: number) => {
    const res = await apiClient.get<StoreResponse[]>(`/store/by-owner/${ownerId}`);
    return res.data;
  },

  createStore: async (data: StoreCreateRequest) => {
    const res = await apiClient.post<StoreResponse>("/store", data);
    return res.data;
  },

  updateStore: async (storeId: number, data: StoreCreateRequest) => {
    const res = await apiClient.put<StoreResponse>(`/store/${storeId}`, data);
    return res.data;
  },

  deleteStore: async (storeId: number, hard: boolean = false) => {
    await apiClient.delete(`/store/${storeId}`, { params: { force: hard } });
  },

  activateStore: async (storeId: number) => {
    await apiClient.patch(`/store/${storeId}/activate`);
  },

  fetchBusinessNumbers: async (ownerId: number) => {
    const res = await apiClient.get<BusinessNumber[]>(`/store/business-numbers/by-owner/${ownerId}`);
    return res.data;
  },

  /* --- 인증 관련 --- */
  requestPhoneVerification: async (phoneNumber: string) => {
    const res = await apiClient.post<PhoneVerifyResponse>("/phone-verify/request", { phoneNumber });
    return res.data;
  },

  pollPhoneVerification: async (authCode: string) => {
    const res = await apiClient.get<PhoneVerifyStatus>("/phone-verify/status", {
      params: { code: authCode },
    });
    return res.data;
  },

  verifyBusinessNumber: async (data: { bizNo: string; phone: string }) => {
    const res = await apiClient.post<any>("/business-number/verify", data);
    return res.data;
  },

  /* --- 직원 (Employee) 검색 관련 --- */

  // ✅ 승인된 사업장만 조회
  getApprovedStoreById: async (storeId: number) => {
    const res = await apiClient.get<Store>(`/store/approved/${storeId}`);
    return res.data;
  },

  // ✅ GPS 좌표만 조회: GET /store/{storeId}/gps
  getStoreGps: async (storeId: number) => {
    const res = await apiClient.get<StoreGpsResponse>(`/store/${storeId}/gps`);
    return res.data;
  },

  // ✅ /assignments/status 는 200 또는 204(No Content)
  fetchAssignmentStatus: async (
    employeeId: number,
    storeId: number
  ): Promise<AssignmentStatus | "NONE"> => {
    try {
      const res = await apiClient.get<{ status: string }>(`/assignments/status`, {
        params: { employeeId, storeId },
      });

      const raw = res.data?.status;
      if (!raw) return "NONE";

      // 백엔드: APPROVED / PENDING / REJECTED
      // 프론트: ACCEPTED / PENDING / REJECTED 로 쓰는 경우 매핑
      if (raw === "APPROVED") return "ACCEPTED" as AssignmentStatus;

      return raw as AssignmentStatus;
    } catch (e: any) {
      if (e?.response?.status === 204 || e?.response?.status === 404) return "NONE";
      throw e;
    }
  },

  applyToStore: async (data: { employeeId: number; storeId: number; role: string }) => {
    await apiClient.post(`/assignments/apply`, data);
  },
};

export const extractErrorMessage = (error: any): string => {
  if (typeof error === "string") return error;
  if (error?.response?.data) {
    if (typeof error.response.data === "string") return error.response.data;
    if (error.response.data.message) return error.response.data.message;
  }
  return error?.message || "알 수 없는 오류가 발생했습니다.";
};