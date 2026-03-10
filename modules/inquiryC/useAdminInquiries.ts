"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inquiryApi } from "./inquiryApi";
import { useToast } from "@/shared/ui/use-toast";
import { InquiryStatus, InquiryCategory, ReplyInquiryRequest } from "./inquiryTypes";

// page를 인자로 받도록 수정 (화면에서 page를 넘겨주고 있음)
export function useAdminInquiries(page: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const pageSize = 10;

  // 필터 상태 관리
  const [filterStatus, setFilterStatus] = useState<InquiryStatus | "ALL">("ALL");
  const [filterCategory, setFilterCategory] = useState<InquiryCategory | "ALL">("ALL");

  // 데이터 조회
  const query = useQuery({
    queryKey: ["adminInquiries", page, pageSize, filterStatus, filterCategory],
    queryFn: () => inquiryApi.getInquiries({
      page,
      size: pageSize,
      // "ALL"이면 undefined를 보내 필터 해제
      status: filterStatus === "ALL" ? undefined : filterStatus,
      category: filterCategory === "ALL" ? undefined : filterCategory
    }),
  });

  const replyMutation = useMutation({
    mutationFn: (data: ReplyInquiryRequest) => 
      inquiryApi.replyInquiry(data.inquiryId, data.answer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminInquiries"] });
      toast({ title: "답변이 등록되었습니다." });
    },
    onError: (err: any) => {
      toast({ 
        variant: "destructive", 
        title: "실패", 
        description: err.response?.data?.message || "답변 등록 중 오류가 발생했습니다." 
      });
    }
  });

  return {
    // 화면에서 사용하는 변수명으로 리턴
    inquiries: query.data?.content || [], 
    isLoading: query.isLoading,
    totalPages: query.data?.totalPages || 0,
    totalElements: query.data?.totalElements || 0,
    
    // 필터 제어
    filterStatus, setFilterStatus,
    filterCategory, setFilterCategory,
    
    // 답변 함수
    replyInquiry: replyMutation.mutateAsync
  };
}