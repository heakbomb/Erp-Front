"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inquiryApi } from "./inquiryApi";
import { useToast } from "@/shared/ui/use-toast";
import { CreateInquiryRequest } from "./inquiryTypes";

export function useInquiries() {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 조회
  const query = useQuery({
    queryKey: ["myInquiries", page],
    queryFn: () => inquiryApi.getMyInquiries({ page, size: pageSize }),
  });

  // 등록
  const createMutation = useMutation({
    mutationFn: (data: CreateInquiryRequest) => inquiryApi.createInquiry(data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["myInquiries"] });
        toast({ title: "문의가 성공적으로 등록되었습니다." });
    },
    onError: (err: any) => {
        toast({ 
            variant: "destructive", 
            title: "등록 실패", 
            description: err.response?.data?.message || "오류가 발생했습니다."
        });
    }
  });

  // 삭제 (이게 없어서 InquiryList에서 오류 발생)
  const deleteMutation = useMutation({
    mutationFn: (inquiryId: number) => inquiryApi.deleteInquiry(inquiryId),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["myInquiries"] });
        toast({ title: "문의가 삭제되었습니다." });
    },
    onError: (err: any) => {
        toast({ 
            variant: "destructive", 
            title: "삭제 실패", 
            description: err.response?.data?.message || "오류가 발생했습니다."
        });
    }
  });

  return {
    inquiries: query.data?.content || [],
    totalElements: query.data?.totalElements || 0,
    totalPages: query.data?.totalPages || 0,
    isLoading: query.isLoading,
    
    page, 
    setPage,
    
    createInquiry: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    // 삭제 기능 내보내기
    deleteInquiry: deleteMutation.mutateAsync 
  };
}