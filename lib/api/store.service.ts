import { apiClient } from "./client";
import type { Store, BusinessNumber } from "../types/database"; // ⬅️ 경로 수정

/**
 * (사장) 자신의 모든 사업장 목록 조회
 *
 */
export const getMyStores = async () => {
  // ⬇️ [수정] "/api/store" -> "/store"
  const res = await apiClient.get<Store[]>("/store");
  return res.data;
};

type StoreCreateBody = {
  // ... (이하 동일)
};

/**
 * (사장) 새 사업장 생성
 *
 */
export const createStore = async (body: StoreCreateBody) => {
  // ⬇️ [수정] "/api/store" -> "/store"
  const res = await apiClient.post<Store>("/store", body);
  return res.data;
};

/**
 * (사장) 사업장 정보 수정
 *
 */
export const updateStore = async (storeId: number, body: StoreCreateBody) => {
  // ⬇️ [수정]
  const res = await apiClient.put<Store>(`/store/${storeId}`, body);
  return res.data;
};

/**
 * (사장) 사업장 삭제
 *
 */
export const deleteStore = async (storeId: number, force: boolean = false) => {
  // ⬇️ [수정]
  await apiClient.delete(`/store/${storeId}`, { params: { force } });
};

/**
 * (직원) 사업장 코드로 1개 조회
 *
 */
export const getStoreById = async (storeId: number) => {
  // ⬇️ [수정]
  const res = await apiClient.get<Store>(`/store/${storeId}`);
  return res.data;
};

// --- 사업자 인증 관련 ---

/**
 * (사장) 1. 인증 문자열 요청
 *
 */
export const requestPhoneVerifyCode = async (phoneNumber: string) => {
  // ⬇️ [수정]
  const res = await apiClient.post<{ authCode: string }>(
    "/phone-verify/request",
    { phoneNumber }
  );
  return res.data;
};

/**
 * (사장) 2. 인증 상태 폴링
 *
 */
export const checkPhoneVerifyStatus = async (code: string) => {
  // ⬇️ [수정]
  const res = await apiClient.get<{ status: string }>("/phone-verify/status", {
    params: { code },
  });
  return res.data;
};

/**
 * (사장) 3. 최종 사업자 인증
 *
 */
export const verifyBusinessNumber = async (body: {
  bizNo: string;
  phone: string;
}) => {
  // ⬇️ [수정]
  const res = await apiClient.post<BusinessNumber>(
    "/business-number/verify",
    body
  );
  return res.data;
};