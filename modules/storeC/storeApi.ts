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

export const storeApi = {
  /* --- 관리자 (Admin) 기능 (기존 유지) --- */
  getStores: async (params: AdminGetStoresParams) => {
    const res = await apiClient.get<PageResponse<Store>>("/admin/stores", { params });
    return res.data;
  },

  updateStoreStatus: async (storeId: number, body: UpdateStoreStatusBody) => {
    const res = await apiClient.patch<Store>(`/admin/stores/${storeId}/status`, body);
    return res.data;
  },

  /* --- 사장님 (Owner) 기능 - features 로직 이식 --- */
  
  // 매장 목록 조회
  fetchMyStores: async (ownerId: number = 1) => {
    // features: /store/by-owner/${ownerId} 사용
    const res = await apiClient.get<StoreResponse[]>(`/store/by-owner/${ownerId}`);
    return res.data;
  },

  // 매장 생성
  createStore: async (data: StoreCreateRequest) => {
    const res = await apiClient.post<StoreResponse>("/store", data);
    return res.data;
  },

  // 매장 정보 수정
  updateStore: async (storeId: number, data: StoreCreateRequest) => {
    const res = await apiClient.put<StoreResponse>(`/store/${storeId}`, data);
    return res.data;
  },

  // 매장 삭제 (소프트/하드)
  deleteStore: async (storeId: number, hard: boolean = false) => {
    await apiClient.delete(`/store/${storeId}`, { params: { force: hard } });
  },

  // 매장 활성화
  activateStore: async (storeId: number) => {
    await apiClient.patch(`/store/${storeId}/activate`);
  },

  // 사업자 번호 목록 조회
  fetchBusinessNumbers: async (ownerId: number) => {
    const res = await apiClient.get<BusinessNumber[]>(`/store/business-numbers/by-owner/${ownerId}`);
    return res.data;
  },

  /* --- 인증 관련 (Features 로직) --- */
  
  // 전화번호 인증 요청
  requestPhoneVerification: async (phoneNumber: string) => {
    const res = await apiClient.post<PhoneVerifyResponse>("/phone-verify/request", { phoneNumber });
    return res.data;
  },

  // 인증 상태 확인 (폴링)
  pollPhoneVerification: async (authCode: string) => {
    const res = await apiClient.get<PhoneVerifyStatus>("/phone-verify/status", {
      params: { code: authCode },
    });
    return res.data;
  },

  // 사업자 번호 검증 및 저장
  verifyBusinessNumber: async (data: { bizNo: string; phone: string }) => {
    const res = await apiClient.post<any>("/business-number/verify", data);
    return res.data;
  },

  /* --- 직원 (Employee) QR 및 검색 관련 (기존 유지) --- */
  fetchStoreQr: async (storeId: number) => {
    const res = await apiClient.get<{ qrCode: string }>(`/store/${storeId}/qr`);
    return res.data;
  },

  getStoreById: async (storeId: number) => {
    const res = await apiClient.get<Store>(`/store/${storeId}`);
    return res.data;
  },

  fetchAssignmentStatus: async (storeId: number) => {
    const res = await apiClient.get<{ status: AssignmentStatus }>(`/employee/applications/status`, {
      params: { storeId },
    });
    return res.data.status;
  },

  applyToStore: async (storeId: number) => {
    await apiClient.post(`/employee/applications`, { storeId });
  },
};

// 에러 메시지 추출 유틸 (Features와 동일하게 구현)
export const extractErrorMessage = (error: any): string => {
  if (typeof error === "string") return error;
  if (error?.response?.data) {
    if (typeof error.response.data === "string") return error.response.data;
    if (error.response.data.message) return error.response.data.message;
  }
  return error?.message || "알 수 없는 오류가 발생했습니다.";

  
};
