import axios from "axios";

export const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080").replace(/\/$/, "");

// ===== Types =====
export type StoreType = {
  storeId: number;
  bizId?: number;
  storeName: string;
  industry: string;
  posVendor: string | null;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type BusinessVerifyPayload = {
  bizNo: string;
  phone: string;
};

// ===== Store APIs =====
export async function fetchStores() {
  const res = await axios.get(`${API_BASE}/api/store`);
  return res.data as StoreType[];
}

export async function createStore(payload: {
  bizId: number;
  storeName: string;
  industry: string;
  posVendor?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const res = await axios.post(`${API_BASE}/api/store`, payload);
  return res.data as StoreType;
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
  const res = await axios.put(`${API_BASE}/api/store/${storeId}`, payload);
  return res.data as StoreType;
}

export async function deleteStore(storeId: number, force = false) {
  const res = await axios.delete(`${API_BASE}/api/store/${storeId}`, { params: { force } });
  return res.data;
}

// ===== Phone verify =====
export async function requestPhoneVerification(phoneNumber: string) {
  const res = await axios.post(`${API_BASE}/phone-verify/request`, { phoneNumber });
  return res.data as { authCode: string };
}

export async function pollPhoneVerification(code: string) {
  const res = await axios.get(`${API_BASE}/phone-verify/status`, { params: { code } });
  return res.data as { status: "VERIFIED" | "EXPIRED" | "PENDING" };
}

// ===== Business verify =====
export async function verifyBusinessNumber(payload: BusinessVerifyPayload) {
  const res = await axios.post(`${API_BASE}/business-number/verify`, payload);
  return res.data; 
}

// ===== 공용 에러 메시지 =====
export function extractErrorMessage(e: any): string {
  const data = e?.response?.data;
  if (typeof data === "string") return data;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;
  if (typeof data?.detail === "string") return data.detail;
  if (typeof e?.message === "string") return e.message;
  return "인증 중 오류가 발생했습니다.";
}