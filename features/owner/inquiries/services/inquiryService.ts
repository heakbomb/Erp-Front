// features/owner/inquiries/services/inquiryService.ts
import { apiClient } from "@/shared/api/apiClient";
import { InquiryCreateRequest, InquiryResponse } from "@/shared/types/inquiry";
import { PageResponse } from "@/shared/types/api";

const BASE_URL = "/owner/inquiries";

export const inquiryService = {
  // 문의 목록 조회 (최신순 정렬 추가)
  getMyInquiries: async (ownerId: number, page: number = 0, size: number = 10) => {
    const response = await apiClient.get<PageResponse<InquiryResponse>>(BASE_URL, {
      params: { 
        ownerId, 
        page, 
        size,
        sort: "createdAt,desc" // ✅ 최신순 정렬 파라미터 추가
      },
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