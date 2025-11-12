"use client";

import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

// 필요시 404/400/405일 때 /api ↔ 무접두 폴백 
async function requestWithFallback<T>(
  call: () => Promise<{ data: T }>,
  fallback: () => Promise<{ data: T }>
): Promise<T> {
  try {
    const { data } = await call();
    return data;
  } catch (e: any) {
    const s = e?.response?.status;
    if (s && [400, 404, 405].includes(s)) {
      const { data } = await fallback();
      return data;
    }
    throw e;
  }
}

export type PreviewStore = {
  id: number;
  name: string;
  code: string;
  address?: string;
  industry?: string;
  employees?: number;
};

// 단건 사업장 조회 (storeId)
export async function fetchStoreById(storeId: number): Promise<PreviewStore> {
  // 1차: /api/store/:id  →  2차: /store/:id
  const raw = await requestWithFallback<any>(
    () => axios.get(`${API_BASE}/api/store/${storeId}`),
    () => axios.get(`${API_BASE}/store/${storeId}`)
  );

  return {
    id: raw.storeId,
    name: raw.storeName ?? `사업장 #${storeId}`,
    code: String(raw.storeId),
    address: "-", // 아직 주소 필드가 없으므로 그대로
    industry: raw.industry ?? "-",
    employees: undefined,
  };
}

export type ApplyPayload = {
  employeeId: number;
  storeId: number;
  role: string;
};

// 근무 신청
export async function applyToStore(payload: ApplyPayload): Promise<void> {
  // 1차: /api/assignments/apply  →  2차: /assignments/apply
  await requestWithFallback<void>(
    () => axios.post(`${API_BASE}/api/assignments/apply`, payload),
    () => axios.post(`${API_BASE}/assignments/apply`, payload)
  );
}