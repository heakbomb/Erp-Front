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

// ✅ 신규: 신청 상태 타입
export type AssignmentStatus = "PENDING" | "APPROVED" | "REJECTED";

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

// ✅ 신규: 특정 직원-사업장 신청 상태 조회
export async function fetchAssignmentStatus(
  employeeId: number,
  storeId: number,
): Promise<AssignmentStatus | "NONE"> {
  try {
    const { data } = await apiClient.get<{
      assignmentId: number;
      employeeId: number;
      storeId: number;
      role: string;
      status: AssignmentStatus;
    }>("/assignments/status", {
      params: { employeeId, storeId },
    });

    return data.status;
  } catch (e: any) {
    const status = e?.response?.status;

    // 백엔드에서 404 던지면: 아직 신청 이력 없음
    if (status === 404) {
      return "NONE";
    }

    // 그 외는 상위에서 처리
    throw e;
  }
}