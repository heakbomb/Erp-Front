// features/owner/stores/services/storesService.ts
import { apiClient } from "@/lib/api/client";
import { extractErrorMessage as utilExtractErrorMessage } from "@/lib/utils";
// ✅ 1. database.ts의 'Store' 타입을 직접 임포트합니다.
import type { Store } from "@/lib/types/database";

// ✅ 2. StoreType을 Store의 별칭으로 export 합니다.
export type StoreType = Store;

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

// ✅ 3. deleteStore 함수를 정상적으로 export 합니다.
export async function deleteStore(storeId: number, force = false) {
  const res = await apiClient.delete(`/store/${storeId}`, { params: { force } });
  return res.data;
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