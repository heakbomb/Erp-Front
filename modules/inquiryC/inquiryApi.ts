// modules/inquiryC/inquiryApi.ts
import { apiClient } from "@/shared/api/apiClient";
import type { PageResponse } from "@/shared/types/api"; // shared 경로는 프로젝트 상황에 맞게
import type { 
  Inquiry, 
  CreateInquiryRequest, 
  ReplyInquiryRequest, 
  AdminInquiryParams,
  OwnerInquiryParams
} from "./inquiryTypes";

export const inquiryApi = {
  // ---------------------------------------------
  // [사장님] 고객센터 (features/owner/inquiries/services/inquiryService.ts)
  // ---------------------------------------------

  // 내 문의 내역 조회
  getMyInquiries: async ({ ownerId, page, size, sort = "createdAt,desc" }: OwnerInquiryParams) => {
    const response = await apiClient.get<PageResponse<Inquiry>>("/owner/inquiries", {
      params: { 
        ownerId, 
        page, 
        size,
        sort 
      },
    });
    return response.data;
  },

  // 문의 등록
  createInquiry: async (ownerId: number, data: CreateInquiryRequest) => {
    await apiClient.post("/owner/inquiries", data, {
      params: { ownerId },
    });
  },

  // 문의 삭제
  deleteInquiry: async (ownerId: number, inquiryId: number) => {
    await apiClient.delete(`/owner/inquiries/${inquiryId}`, {
      params: { ownerId },
    });
  },

  // ---------------------------------------------
  // [관리자] 문의 관리 (features/admin/inquiries/services/adminInquiryService.ts)
  // ---------------------------------------------

  // 전체 문의 조회
  getAdminInquiries: async ({ page, size, status, category }: AdminInquiryParams) => {
    const params: any = { page, size };
    
    if (status && status !== "ALL") {
      params.status = status;
    }
    if (category && category !== "ALL") {
      params.category = category;
    }

    const response = await apiClient.get<PageResponse<Inquiry>>("/admin/inquiries", { params });
    return response.data;
  },

  // 답변 등록
  replyInquiry: async (adminId: number, inquiryId: number, answer: string) => {
    const payload: ReplyInquiryRequest = { answer };
    await apiClient.put(`/admin/inquiries/${inquiryId}/reply`, payload, {
      params: { adminId },
    });
  },
};