import { apiClient } from "@/shared/api/apiClient";

// ✅ StoreCreateRequest에 gpsRadiusM 추가
export interface StoreCreateRequest {
  bizId: number;
  storeName: string;
  industry: string;
  posVendor?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  gpsRadiusM?: number | null;
}

// ✅ StoreResponse 정의
export interface StoreResponse {
  storeId: number;
  bizId: number;
  storeName: string;
  industry: string;
  posVendor?: string | null;
  status: string;
  bizNum: string;
  latitude?: number | null;
  longitude?: number | null;
  gpsRadiusM?: number | null;
  active:boolean;
}

export type StoreType = StoreResponse;

export interface BusinessNumber {
  bizId: number;
  bizNum: string;
  phone: string;
  ownerName: string;
}

// ⭐️ [추가] 인증 관련 응답 타입 정의
interface PhoneVerifyResponse {
  authCode: string;
}

interface PhoneVerifyStatus {
  status: "PENDING" | "VERIFIED" | "EXPIRED";
}

// --- API 함수들 ---

export const fetchStores = async () => {
  // 🔴 [수정] 백엔드 경로 불일치 해결 (/owner/stores -> /store/by-owner/1)
  // TODO: 실제 로그인된 ownerId를 컨텍스트에서 가져와야 합니다. 현재는 1로 고정.
  const ownerId = 1; 
  const res = await apiClient.get<StoreResponse[]>(`/store/by-owner/${ownerId}`);
  return res.data;
};

export const createStore = async (data: StoreCreateRequest) => {
  // 🔴 [수정] 백엔드 경로 불일치 해결 (/owner/stores -> /store)
  const res = await apiClient.post<StoreResponse>("/store", data);
  return res.data;
};

export const updateStore = async (storeId: number, data: StoreCreateRequest) => {
  // 🔴 [수정] 백엔드 경로 불일치 해결 (/owner/stores/... -> /store/...)
  const res = await apiClient.put<StoreResponse>(`/store/${storeId}`, data);
  return res.data;
};

export const deleteStore = async (storeId: number, hard: boolean = false) => {
  // 🔴 [수정] 백엔드 경로 불일치 해결
  await apiClient.delete(`/store/${storeId}`, { params: { force: hard } });
};

export const activateStore = async (storeId: number) => {
  // 🔴 [수정] 백엔드 경로 불일치 해결
  await apiClient.patch(`/store/${storeId}/activate`);
};

export const fetchBusinessNumbersByOwner = async (ownerId: number) => {
  const res = await apiClient.get<BusinessNumber[]>(`/store/business-numbers/by-owner/${ownerId}`);
  return res.data;
};

// ⭐️ [추가] 전화번호 인증 요청
export const requestPhoneVerification = async (phoneNumber: string) => {
  // 백엔드: PhoneVerifyController -> POST /phone-verify/request
  const res = await apiClient.post<PhoneVerifyResponse>("/phone-verify/request", { phoneNumber });
  return res.data;
};

// ⭐️ [추가] 인증 상태 확인 (폴링용)
export const pollPhoneVerification = async (authCode: string) => {
  // 백엔드: PhoneVerifyController -> GET /phone-verify/status?code=...
  const res = await apiClient.get<PhoneVerifyStatus>("/phone-verify/status", {
    params: { code: authCode },
  });
  return res.data;
};

// ⭐️ [추가] 사업자 번호 검증 및 저장
export const verifyBusinessNumber = async (data: { bizNo: string; phone: string }) => {
  // 백엔드: BusinessNumberController -> POST /business-number/verify
  const res = await apiClient.post<any>("/business-number/verify", data);
  return res.data;
};

// ⭐️ [추가] 에러 메시지 추출 유틸 함수
export const extractErrorMessage = (error: any): string => {
  if (typeof error === "string") return error;
  if (error?.response?.data) {
    if (typeof error.response.data === "string") return error.response.data;
    if (error.response.data.message) return error.response.data.message;
  }
  return error?.message || "알 수 없는 오류가 발생했습니다.";
};