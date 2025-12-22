// modules/inquiryC/inquiryTypes.ts

export type InquiryStatus = "PENDING" | "RESPONDED";
export type InquiryCategory = "INQUIRY" | "SUGGESTION" | "REPORT";

// 공통 Inquiry 응답 객체 (InquiryResponse)
export interface Inquiry {
  inquiryId: number;
  ownerId: number;
  category: InquiryCategory;
  title: string;
  content: string;
  answer?: string | null;
  status: InquiryStatus;
  createdAt: string | number[]; // 백엔드 응답에 따라 다를 수 있으나 features 로직 대응
  answeredAt?: string | number[] | null;
  
  // 관리자 화면용 추가 정보
  ownerName?: string;
  storeName?: string;
}

// [사장님] 문의 등록 요청
export interface CreateInquiryRequest {
  category: InquiryCategory;
  title: string;
  content: string;
  storeId?: number | null;
  createdAt?: string; // 클라이언트 생성 시간 (features 로직 반영)
}

// [관리자] 답변 등록 요청
export interface ReplyInquiryRequest {
  answer: string;
}

// [관리자] 검색 파라미터
export interface AdminInquiryParams {
  page: number;
  size: number;
  status?: InquiryStatus | "ALL";
  category?: InquiryCategory | "ALL";
}

// [사장님] 검색 파라미터
export interface OwnerInquiryParams {
  ownerId: number;
  page: number;
  size: number;
  sort?: string;
}