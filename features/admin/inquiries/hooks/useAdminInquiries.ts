// features/admin/inquiries/hooks/useAdminInquiries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminInquiryService } from "../services/adminInquiryService";
import { InquiryStatus, InquiryCategory } from "@/shared/types/inquiry";
import { toast } from "sonner";
import { useState } from "react";

// ✅ page, size 파라미터 추가 (기본 size=6)
export const useAdminInquiries = (page: number = 0, size: number = 10) => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<InquiryStatus | "ALL">("ALL");
  const [filterCategory, setFilterCategory] = useState<InquiryCategory | "ALL">("ALL");

  // 목록 조회 (쿼리 키에 page, size 추가)
  const { data, isLoading } = useQuery({
    queryKey: ["admin-inquiries", filterStatus, filterCategory, page, size],
    queryFn: () => adminInquiryService.getAllInquiries(filterStatus, filterCategory, page, size),
  });

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
    
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    replyInquiry: replyMutation.mutateAsync,
    isReplying: replyMutation.isPending,
  };
};