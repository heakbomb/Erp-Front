// lib/types/inquiry.ts

export type InquiryStatus = 'PENDING' | 'RESPONDED';
export type InquiryCategory = 'REPORT' | 'SUGGESTION' | 'INQUIRY';

export interface InquiryResponse {
  inquiryId: number;
  ownerName: string;
  adminName?: string;
  storeName?: string;
  category: InquiryCategory;
  title: string;
  content: string;
  answer?: string;
  status: InquiryStatus;
  createdAt: string;
  answeredAt?: string;
}

export interface InquiryCreateRequest {
  category: InquiryCategory;
  title: string;
  content: string;
  storeId?: number | null; // 선택 사항
}