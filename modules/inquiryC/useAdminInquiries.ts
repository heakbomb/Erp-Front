// modules/inquiryC/useAdminInquiries.ts
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inquiryApi } from "./inquiryApi";
import { InquiryStatus, InquiryCategory } from "./inquiryTypes";
import { toast } from "sonner"; // 혹은 사용중인 toast 라이브러리

export const useAdminInquiries = (page: number = 0, size: number = 10) => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<InquiryStatus | "ALL">("ALL");
  const [filterCategory, setFilterCategory] = useState<InquiryCategory | "ALL">("ALL");

  // 목록 조회
  const { data, isLoading } = useQuery({
    queryKey: ["admin-inquiries", filterStatus, filterCategory, page, size],
    queryFn: () => inquiryApi.getAdminInquiries({
      status: filterStatus,
      category: filterCategory,
      page,
      size
    }),
  });

  // 답변 등록 Mutation
  const replyMutation = useMutation({
    mutationFn: ({ adminId, inquiryId, answer }: { adminId: number; inquiryId: number; answer: string }) =>
      inquiryApi.replyInquiry(adminId, inquiryId, answer),
    onSuccess: () => {
      toast.success("답변이 등록되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "답변 등록 실패");
    },
  });

  return {
    inquiries: data?.content || [],
    totalElements: data?.totalElements || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    replyInquiry: replyMutation.mutateAsync,
    isReplying: replyMutation.isPending,
  };
};