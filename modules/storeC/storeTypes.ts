// modules/storeC/storeTypes.ts

/* --- 공통 / DB 매핑 --- */

// 1. 업종 Enum 정의 (백엔드와 일치)
export enum StoreIndustry {
  KOREAN = 'KOREAN',
  CHINESE = 'CHINESE',
  JAPANESE = 'JAPANESE',
  WESTERN = 'WESTERN',
  ASIAN = 'ASIAN',
  SNACK = 'SNACK',
  BBQ = 'BBQ',
  SEAFOOD = 'SEAFOOD',
  FAST_FOOD = 'FAST_FOOD',
  CHICKEN = 'CHICKEN',
  CAFE = 'CAFE',
  BAKERY = 'BAKERY',
  BAR = 'BAR',
  FUSION = 'FUSION',
}

// 2. 한글 라벨 매핑 (화면 표시용)
export const STORE_INDUSTRY_LABELS: Record<StoreIndustry, string> = {
  [StoreIndustry.KOREAN]: '한식 (일반 백반, 국밥, 찌개)',
  [StoreIndustry.CHINESE]: '중식',
  [StoreIndustry.JAPANESE]: '일식 (초밥, 라멘, 덮밥)',
  [StoreIndustry.WESTERN]: '양식 (파스타, 스테이크, 피자)',
  [StoreIndustry.ASIAN]: '아시아 음식 (베트남, 태국, 인도)',
  [StoreIndustry.SNACK]: '분식 (김밥, 떡볶이)',
  [StoreIndustry.BBQ]: '고기/구이',
  [StoreIndustry.SEAFOOD]: '해산물/회',
  [StoreIndustry.FAST_FOOD]: '패스트푸드 (햄버거, 샌드위치)',
  [StoreIndustry.CHICKEN]: '치킨 (호프 포함)',
  [StoreIndustry.CAFE]: '카페/디저트',
  [StoreIndustry.BAKERY]: '베이커리/제과점',
  [StoreIndustry.BAR]: '주점/술집 (호프, 이자카야, 와인바)',
  [StoreIndustry.FUSION]: '퓨전/기타',
};

export interface Store {
  storeId: number;
  bizId: number;
  storeName: string;
  industry: StoreIndustry; // ✅ string -> StoreIndustry 변경
  posVendor?: string | null;
  status: string; 
  bizNum: string;
  latitude?: number | null;
  longitude?: number | null;
  gpsRadiusM?: number | null;
  active: boolean;
  
  // features에는 없지만 modules 기존 코드 호환성을 위해 유지
  createdAt?: string;
  ownerName?: string;
}

/* --- 사장님 (Owner) 요청/응답 --- */
export interface StoreCreateRequest {
  bizId: number;
  storeName: string;
  industry: StoreIndustry; // ✅ string -> StoreIndustry 변경
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

/* --- 관리자 (Admin) 요청/응답 --- */
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

/* --- 직원 (Employee) 검색/지원 관련 --- */
export interface PreviewStore {
  storeId: number;
  storeName: string;
  industry: StoreIndustry; // ✅ string -> StoreIndustry 변경
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