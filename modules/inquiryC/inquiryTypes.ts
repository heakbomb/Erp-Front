export type InquiryStatus = "PENDING" | "RESPONDED";
export type InquiryCategory = "INQUIRY" | "SUGGESTION" | "REPORT";

// [공통] 문의 데이터 구조
export interface Inquiry {
  inquiryId: number;       // 백엔드와 일치
  title: string;
  content: string;
  answer?: string;
  status: InquiryStatus;
  category: InquiryCategory;
  createdAt: string;
  answeredAt?: string;
  
  // 관리자 화면용 추가 필드
  ownerName?: string;
  storeName?: string;
  adminName?: string; 
}

// [사장님] 문의 등록 요청 (이게 없어서 api 파일 에러 발생 중)
export interface CreateInquiryRequest {
  title: string;
  content: string;
  category: InquiryCategory;
  storeId?: number; 
  isSecret?: boolean;
}

// [사장님] 목록 조회 파라미터
export interface OwnerInquiryParams {
  page: number;
  size: number;
}

// [관리자] 목록 조회 파라미터
export interface AdminInquiryParams {
  page: number;
  size: number;
  status?: InquiryStatus;
  category?: InquiryCategory;
}

// [관리자] 답변 등록 요청
export interface ReplyInquiryRequest {
  adminId: number;
  inquiryId: number;
  answer: string;
}