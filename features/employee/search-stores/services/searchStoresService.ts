"use client";

import { apiClient } from "@/lib/api/client"; // ✅ apiClient 사용

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
  // ✅ apiClient로 직접 호출
  const { data: raw } = await apiClient.get<any>(`/store/${storeId}`);

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
  // ✅ apiClient로 직접 호출
  await apiClient.post<void>(`/assignments/apply`, payload);
}