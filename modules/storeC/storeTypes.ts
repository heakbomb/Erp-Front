// modules/storeC/storeTypes.ts

/* --- 공통 / DB 매핑 --- */
export interface Store {
  storeId: number;
  bizId: number;
  storeName: string;
  industry: string;
  posVendor?: string | null;
  status: string; // features에 맞춰 string으로 완화 (기존: "PENDING" | "APPROVED" | "REJECTED")
  bizNum: string;
  latitude?: number | null;
  longitude?: number | null;
  gpsRadiusM?: number | null;
  active: boolean;
  
  // features에는 없지만 modules 기존 코드 호환성을 위해 유지 (필요 시 선택적 속성으로)
  createdAt?: string;
  ownerName?: string;
}

/* --- 사장님 (Owner) 요청/응답 --- */
// features/owner/stores/services/storesService.ts 의 StoreCreateRequest와 일치
export interface StoreCreateRequest {
  bizId: number;
  storeName: string;
  industry: string;
  posVendor?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  gpsRadiusM?: number | null;
}

// features 코드 호환을 위한 타입 별칭
export type StoreResponse = Store;
export type StoreType = Store; 

export interface BusinessNumber {
  bizId: number;
  bizNum: string;
  phone: string;
  ownerName: string;
}

export interface PhoneVerifyResponse {
  authCode: string;
}

export interface PhoneVerifyStatus {
  status: "PENDING" | "VERIFIED" | "EXPIRED";
}

/* --- 관리자 (Admin) 요청/응답 (기존 유지) --- */
export interface AdminGetStoresParams {
  page: number;
  size: number;
  status: string;
  q: string;
}

export interface UpdateStoreStatusBody {
  status: "APPROVED" | "REJECTED";
  reason?: string;
}

/* --- 직원 (Employee) 검색/지원 관련 (기존 유지) --- */
export interface PreviewStore {
  storeId: number;
  storeName: string;
  industry: string;
  distance: number;
  description?: string;
  image?: string;
  address?: string;
  employeeCount?: number;
}

export type AssignmentStatus = "NONE" | "PENDING" | "ACCEPTED" | "REJECTED";

export type ApplyPayload = {
  employeeId: number;
  storeId: number;
  role: string;
};