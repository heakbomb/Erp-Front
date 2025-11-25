// features/owner/shifts/hooks/useEmployeeShifts.ts
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useStore } from "@/contexts/StoreContext"
import type { EmployeeShift } from "@/lib/types/database"
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

  const createMutation = useMutation({
    mutationFn: (body: Omit<SaveShiftPayload, "storeId">) =>
      createShiftApi({
        storeId: currentStoreId!,
        ...body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employeeShifts", currentStoreId],
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (params: { shiftId: number; body: Partial<SaveShiftPayload> }) =>
      updateShiftApi(currentStoreId!, params.shiftId, params.body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employeeShifts", currentStoreId],
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (shiftId: number) => deleteShiftApi(currentStoreId!, shiftId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employeeShifts", currentStoreId],
      })
    },
  })

  // ✅ 추가: 기간 일괄 삭제 mutation
  const deleteRangeMutation = useMutation({
    mutationFn: (body: Omit<DeleteShiftRangeParams, "storeId">) =>
      deleteShiftRangeApi({
        storeId: currentStoreId!,
        ...body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employeeShifts", currentStoreId],
      })
    },
  })


  return {
    ...query,
    createShift: createMutation.mutateAsync,
    updateShift: updateMutation.mutateAsync,
    deleteShift: deleteMutation.mutateAsync,
    deleteShiftRange: deleteRangeMutation.mutateAsync,
  }
}