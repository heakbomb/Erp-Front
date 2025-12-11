"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEmployeeProfile, getEmployeeStores, updateEmployeePhone } from "../employeeProfileService";
import { toast } from "sonner";

export function useEmployeeProfile(employeeId: number) {
  const queryClient = useQueryClient();

  // 프로필 조회
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["employeeProfile", employeeId],
    queryFn: () => getEmployeeProfile(employeeId),
    enabled: !!employeeId,
  });

  // 전화번호 수정
  const updateMutation = useMutation({
    mutationFn: (phone: string) => updateEmployeePhone(employeeId, phone),
    onSuccess: () => {
      toast.success("정보가 수정되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["employeeProfile", employeeId] });
    },
    onError: () => {
      toast.error("정보 수정에 실패했습니다.");
    },
  });

  return {
    profile,
    isLoading,
    error,
    updatePhone: updateMutation.mutate,
  };
}

// ✅ [추가] 직원 소속 사업장 목록 조회 훅
export function useEmployeeStores(employeeId: number) {
  const { data: stores, isLoading } = useQuery({
    queryKey: ["employeeStores", employeeId],
    queryFn: () => getEmployeeStores(employeeId),
    enabled: !!employeeId,
  });

  return {
    stores: stores || [],
    isLoading,
  };
}