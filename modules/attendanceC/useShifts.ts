"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/contexts/StoreContext";
import { attendanceApi } from "./attendanceApi";
import type { EmployeeShift, SaveShiftPayload, DeleteShiftRangeParams } from "./attendanceTypes";

export function useShifts(range: { from: string; to: string }) {
  const { currentStoreId } = useStore();
  const queryClient = useQueryClient();
  const enabled = !!currentStoreId;

  const query = useQuery<EmployeeShift[]>({
    queryKey: ["employeeShifts", currentStoreId, range.from, range.to],
    enabled,
    queryFn: () =>
      attendanceApi.fetchShifts({
        storeId: currentStoreId!,
        from: range.from,
        to: range.to,
      }),
  });

  const invalidateShifts = () =>
    queryClient.invalidateQueries({
      queryKey: ["employeeShifts", currentStoreId, range.from, range.to],
    });

  const createMutation = useMutation({
    mutationFn: (body: Omit<SaveShiftPayload, "storeId">) =>
      attendanceApi.createShift({
        storeId: currentStoreId!,
        ...body,
      }),
    onSuccess: invalidateShifts,
  });

  const updateMutation = useMutation({
    mutationFn: (params: { shiftId: number; body: Partial<SaveShiftPayload> }) =>
      attendanceApi.updateShift(currentStoreId!, params.shiftId, params.body),
    onSuccess: invalidateShifts,
  });

  const deleteMutation = useMutation({
    mutationFn: (shiftId: number) => attendanceApi.deleteShift(currentStoreId!, shiftId),
    onSuccess: invalidateShifts,
  });

  const deleteRangeMutation = useMutation({
    mutationFn: (body: Omit<DeleteShiftRangeParams, "storeId">) =>
      attendanceApi.deleteShiftRange({
        storeId: currentStoreId!,
        ...body,
      }),
    onSuccess: invalidateShifts,
  });

  return {
    ...query,
    createShift: createMutation.mutateAsync,
    updateShift: updateMutation.mutateAsync,
    deleteShift: deleteMutation.mutateAsync,
    deleteShiftRange: deleteRangeMutation.mutateAsync,
  };
}