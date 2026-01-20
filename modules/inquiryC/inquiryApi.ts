import { apiClient } from "@/shared/api/apiClient";
import { 
  Inquiry, 
  CreateInquiryRequest, 
  AdminInquiryParams, 
  OwnerInquiryParams 
} from "./inquiryTypes";
import { PageResponse } from "@/shared/types/api";

export const inquiryApi = {
  // [사장님] 내 문의 조회
  getMyInquiries: async (params: OwnerInquiryParams) => {
    const { data } = await apiClient.get<PageResponse<Inquiry>>("/owner/inquiries", {
      params,
    });
    return data;
  },

  // [사장님] 문의 등록
  createInquiry: async (data: CreateInquiryRequest) => {
    await apiClient.post("/owner/inquiries", data);
  },

  // [사장님] 문의 삭제
  deleteInquiry: async (inquiryId: number) => {
    await apiClient.delete(`/owner/inquiries/${inquiryId}`);
  },

  // [관리자] 문의 목록 조회
  getInquiries: async (params: AdminInquiryParams) => {
    const { data } = await apiClient.get<PageResponse<Inquiry>>("/admin/inquiries", {
      params,
    });
    return data;
  },

  // [관리자] 답변 등록
  replyInquiry: async (inquiryId: number, answer: string) => {
    await apiClient.post(`/admin/inquiries/${inquiryId}/reply`, { answer });
  },
};