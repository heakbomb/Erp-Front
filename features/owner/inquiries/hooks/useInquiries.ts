// features/owner/inquiries/hooks/useInquiries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inquiryService } from "../services/inquiryService";
import { InquiryCreateRequest } from "@/lib/types/inquiry";
import { toast } from "sonner"; 

// ✅ size 기본값을 6으로 설정 (한 페이지에 6개씩)
export const useInquiries = (ownerId: number | undefined, page: number = 0, size: number = 6) => {
  const queryClient = useQueryClient();
  
  // ✅ queryKey에 size 추가 (페이지 사이즈 변경 시 재조회)
  const QUERY_KEY = ["owner-inquiries", ownerId, page, size];

  // 목록 조회
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    // ✅ 서비스 함수에 size 전달
    queryFn: () => inquiryService.getMyInquiries(ownerId!, page, size),
    enabled: !!ownerId, 
  });

  // 등록 Mutation
  const createMutation = useMutation({
    mutationFn: (data: InquiryCreateRequest) => 
      inquiryService.createInquiry(ownerId!, data),
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
      inquiryService.deleteInquiry(ownerId!, inquiryId),
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