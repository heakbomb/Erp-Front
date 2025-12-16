import { apiClient } from "@/shared/api/apiClient";
import { InquiryResponse, InquiryStatus, InquiryCategory } from "@/shared/types/inquiry";
import { PageResponse } from "@/shared/types/api";

const BASE_URL = "/admin/inquiries";

export interface ReplyRequest {
  answer: string;
}

export const adminInquiryService = {
  // 전체 문의 조회 (상태 + 카테고리 필터링)
  getAllInquiries: async (
    status?: InquiryStatus | "ALL", 
    category?: InquiryCategory | "ALL", // [추가]
    page: number = 0, 
    size: number = 10
  ) => {
    const params: any = { page, size };
    
    if (status && status !== "ALL") {
      params.status = status;
    }
    // [추가] 카테고리 파라미터 처리
    if (category && category !== "ALL") {
      params.category = category;
    }

    const response = await apiClient.get<PageResponse<InquiryResponse>>(BASE_URL, { params });
    return response.data;
  },

  // 답변 등록
  replyInquiry: async (adminId: number, inquiryId: number, answer: string) => {
    const payload: ReplyRequest = { answer };
    await apiClient.put(`${BASE_URL}/${inquiryId}/reply`, payload, {
      params: { adminId },
    });
  },
};