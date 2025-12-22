// modules/inquiryC/useInquiries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inquiryApi } from "./inquiryApi";
import { CreateInquiryRequest } from "./inquiryTypes";
import { toast } from "sonner";

export const useInquiries = (ownerId: number | undefined, page: number = 0, size: number = 6) => {
  const queryClient = useQueryClient();
  
  const QUERY_KEY = ["owner-inquiries", ownerId, page, size];

  // 목록 조회
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => inquiryApi.getMyInquiries({ ownerId: ownerId!, page, size }),
    enabled: !!ownerId, 
  });

  // 등록 Mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateInquiryRequest) => 
      inquiryApi.createInquiry(ownerId!, data),
    onSuccess: () => {
      toast.success("문의가 등록되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["owner-inquiries"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "문의 등록에 실패했습니다.");
    },
  });

  // 삭제 Mutation
  const deleteMutation = useMutation({
    mutationFn: (inquiryId: number) => 
      inquiryApi.deleteInquiry(ownerId!, inquiryId),
    onSuccess: () => {
      toast.success("문의가 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["owner-inquiries"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "삭제에 실패했습니다.");
    },
  });

  return {
    inquiries: data?.content || [],
    totalElements: data?.totalElements || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    createInquiry: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteInquiry: deleteMutation.mutateAsync,
  };
};