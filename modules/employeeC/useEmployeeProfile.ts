// modules/employeeC/useEmployeeProfile.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEmployeeProfile, getEmployeeStores, updateEmployeePhone } from "./employeeProfileApi";
import { toast } from "sonner";

export function useEmployeeProfile(employeeId: number | null) {
  const queryClient = useQueryClient();

  const enabled = typeof employeeId === "number" && employeeId > 0;

  // 프로필 조회
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["employeeProfile", employeeId],
    queryFn: () => getEmployeeProfile(employeeId as number),
    enabled,
  });

  // 전화번호 수정
  const updateMutation = useMutation({
    mutationFn: (phone: string) => updateEmployeePhone(employeeId as number, phone),
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

export function useEmployeeStores(employeeId: number | null) {
  const enabled = typeof employeeId === "number" && employeeId > 0;

  const { data: stores, isLoading } = useQuery({
    queryKey: ["employeeStores", employeeId],
    queryFn: () => getEmployeeStores(employeeId as number),
    enabled,
  });

  return {
    stores: stores || [],
    isLoading,
  };
}