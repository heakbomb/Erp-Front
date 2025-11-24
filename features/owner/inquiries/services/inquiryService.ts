// features/owner/inquiries/services/inquiryService.ts
import { apiClient } from "@/lib/api/client";
import { InquiryCreateRequest, InquiryResponse } from "@/lib/types/inquiry";
import { PageResponse } from "@/lib/types/api"; // 기존 페이징 타입 활용

const BASE_URL = "/owner/inquiries";

export const inquiryService = {
  // 문의 목록 조회
  getMyInquiries: async (ownerId: number, page: number = 0, size: number = 10) => {
    const response = await apiClient.get<PageResponse<InquiryResponse>>(BASE_URL, {
      params: { ownerId, page, size },
    });
    return response.data;
  },

  // 문의 등록
  createInquiry: async (ownerId: number, data: InquiryCreateRequest) => {
    await apiClient.post(BASE_URL, data, {
      params: { ownerId },
    });
  },

  // 문의 삭제
  deleteInquiry: async (ownerId: number, inquiryId: number) => {
    await apiClient.delete(`${BASE_URL}/${inquiryId}`, {
      params: { ownerId },
    });
  },
};