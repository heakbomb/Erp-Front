// features/owner/stores/services/storesService.ts
import { apiClient } from "@/lib/api/client";
import { extractErrorMessage as utilExtractErrorMessage } from "@/lib/utils";
// ✅ 1. database.ts의 'Store' 타입을 직접 임포트합니다.
import type { Store } from "@/lib/types/database";

// ✅ 2. StoreType을 Store의 별칭으로 export 합니다.
export type StoreType = Store;

// ✅ [추가] 백엔드 BusinessNumberResponse 와 맞는 타입
export interface BusinessNumber {
  bizId: number;
  ownerId: number | null;
  phone: string;
  bizNum: string;
}

export type BusinessVerifyPayload = {
  bizNo: string;
  phone: string;
};

// ===== Store APIs =====
export async function fetchStores() {
  const res = await apiClient.get(`/store`);
  return res.data as Store[]; // ✅ Store[] 타입으로 반환
}

export async function createStore(payload: {
  bizId: number;
  storeName: string;
  industry: string;
  posVendor?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const res = await apiClient.post(`/store`, payload);
  return res.data as Store; // ✅ Store 타입으로 반환
}

export async function updateStore(
  storeId: number,
  payload: {
    bizId: number;
    storeName: string;
    industry: string;
    posVendor?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }
) {
  const res = await apiClient.put(`/store/${storeId}`, payload);
  return res.data as Store; // ✅ Store 타입으로 반환
}

export async function fetchOwnerStores(ownerId: number) {
  const res = await apiClient.get(`/store/owner/${ownerId}`);
  return res.data as { storeId: number; storeName: string }[];
}

// ✅ 3. deleteStore 함수를 정상적으로 export 합니다.
export async function deleteStore(storeId: number, force = false) {
  const res = await apiClient.delete(`/store/${storeId}`, { params: { force } });
  return res.data;
}

// ✅ [추가] 특정 Owner 의 인증된 사업자번호 목록 조회
export async function fetchBusinessNumbersByOwner(ownerId: number) {
  const res = await apiClient.get(`/store/business-numbers/by-owner/${ownerId}`);
  return res.data as BusinessNumber[];
}

// ===== Phone verify =====
export async function requestPhoneVerification(phoneNumber: string) {
  const res = await apiClient.post(`/phone-verify/request`, { phoneNumber });
  return res.data as { authCode: string };
}

export async function pollPhoneVerification(code: string) {
  const res = await apiClient.get(`/phone-verify/status`, { params: { code } });
  return res.data as { status: "VERIFIED" | "EXPIRED" | "PENDING" };
}

// ===== Business verify =====
export async function verifyBusinessNumber(payload: BusinessVerifyPayload) {
  const res = await apiClient.post(`/business-number/verify`, payload);
  return res.data; 
}

// ===== 공용 에러 메시지 =====
export function extractErrorMessage(e: any): string {
  return utilExtractErrorMessage(e);
}