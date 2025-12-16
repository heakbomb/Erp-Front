// features/owner/shifts/hooks/useEmployeeShifts.ts
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useStore } from "@/contexts/StoreContext"
import type { EmployeeShift } from "@/shared/types/database"
import {
  fetchShifts,
  createShift as createShiftApi,
  updateShift as updateShiftApi,
  deleteShift as deleteShiftApi,
  deleteShiftRange as deleteShiftRangeApi,
  type ShiftQueryParams,
  type SaveShiftPayload,
  type DeleteShiftRangeParams,
} from "../services/employeeShiftService"

export function useEmployeeShifts(range: { from: string; to: string }) {
  const { currentStoreId } = useStore()
  const queryClient = useQueryClient()

  const enabled = !!currentStoreId

  const query = useQuery<EmployeeShift[]>({
    queryKey: ["employeeShifts", currentStoreId, range.from, range.to],
    enabled,
    queryFn: () =>
      fetchShifts({
        storeId: currentStoreId!,
        from: range.from,
        to: range.to,
      } as ShiftQueryParams),
  })

  // 🔥 invalidate 함수 만들기 (중복 제거)
  const invalidateShifts = () =>
    queryClient.invalidateQueries({
      queryKey: ["employeeShifts", currentStoreId, range.from, range.to],
    })

  const createMutation = useMutation({
    mutationFn: (body: Omit<SaveShiftPayload, "storeId">) =>
      createShiftApi({
        storeId: currentStoreId!,
        ...body,
      }),
    onSuccess: invalidateShifts,
  })

  const updateMutation = useMutation({
    mutationFn: (params: { shiftId: number; body: Partial<SaveShiftPayload> }) =>
      updateShiftApi(currentStoreId!, params.shiftId, params.body),
    onSuccess: invalidateShifts,
  })

  const deleteMutation = useMutation({
    mutationFn: (shiftId: number) => deleteShiftApi(currentStoreId!, shiftId),
    onSuccess: invalidateShifts,
  })

  const deleteRangeMutation = useMutation({
    mutationFn: (body: Omit<DeleteShiftRangeParams, "storeId">) =>
      deleteShiftRangeApi({
        storeId: currentStoreId!,
        ...body,
      }),
    onSuccess: invalidateShifts,
  })

  return {
    ...query,
    createShift: createMutation.mutateAsync,
    updateShift: updateMutation.mutateAsync,
    deleteShift: deleteMutation.mutateAsync,
    deleteShiftRange: deleteRangeMutation.mutateAsync,
  }
}