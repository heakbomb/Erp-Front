import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminInquiryService } from "../services/adminInquiryService";
import { InquiryStatus, InquiryCategory } from "@/lib/types/inquiry";
import { toast } from "sonner";
import { useState } from "react";

export const useAdminInquiries = (page: number = 0) => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<InquiryStatus | "ALL">("ALL");
  // 카테고리 상태
  const [filterCategory, setFilterCategory] = useState<InquiryCategory | "ALL">("ALL");

  // 목록 조회 (쿼리 키에 filterCategory 추가)
  const { data, isLoading } = useQuery({
    queryKey: ["admin-inquiries", filterStatus, filterCategory, page],
    queryFn: () => adminInquiryService.getAllInquiries(filterStatus, filterCategory, page),
  });

  // 답변 등록 Mutation
  const replyMutation = useMutation({
    mutationFn: ({ adminId, inquiryId, answer }: { adminId: number; inquiryId: number; answer: string }) =>
      adminInquiryService.replyInquiry(adminId, inquiryId, answer),
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
    
    // 필터 상태 반환
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    replyInquiry: replyMutation.mutateAsync,
    isReplying: replyMutation.isPending,
  };
};