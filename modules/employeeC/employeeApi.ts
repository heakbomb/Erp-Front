// modules/employeeC/employeeApi.ts
import { apiClient } from "@/shared/api/apiClient";
import type { StoreEmployee, PendingRequest } from "./employeeTypes";

export const employeeApi = {
  // 직원 목록 조회
  fetchEmployees: async (storeId: number): Promise<StoreEmployee[]> => {
    const res = await apiClient.get<any[]>(`/employees`, {
      params: { storeId },
    });

    const rows = res.data || [];

    return rows.map((raw: any): StoreEmployee => {
      // { employee: { ... } } 형태 대응
      const src = raw.employee ?? raw;

      return {
        employeeId: src.employeeId ?? src.id ?? src.employee_id,
        name: src.name ?? src.employeeName ?? src.employee_name ?? "",
        email: src.email ?? "",
        phone: src.phone ?? "",
        provider: src.provider ?? src.providerType ?? "",
        provider_id: src.provider_id ?? src.providerId ?? null,
        createdAt: src.createdAt ?? src.created_at ?? null,
        // 배정 ID (삭제 시 사용)
        assignmentId: raw.assignmentId ?? raw.assignment_id ?? null,
      };
    });
  },

  // 직원 정보 수정
  updateEmployee: async (payload: {
    employeeId: number;
    name: string;
    email: string;
    phone: string;
    provider: string;
  }) => {
    const { employeeId, ...body } = payload;
    await apiClient.put(`/employees/${employeeId}`, body);
  },

  // 직원 삭제 (배정 해제)
  deleteEmployee: async (assignmentId: number) => {
    // features 로직: DELETE /employees/{assignmentId} 사용 (배정 ID 기준)
    await apiClient.delete(`/employees/${assignmentId}`);
  },

  /* ───────── Pending(신청/승인/거절) ───────── */
  
  fetchPendingAssignments: async (storeId: number): Promise<PendingRequest[]> => {
    const res = await apiClient.get<PendingRequest[]>(`/assignments/pending`, {
      params: { storeId },
    });
    return res.data || [];
  },

  approveAssignment: async (assignmentId: number) => {
    await apiClient.post(`/assignments/${assignmentId}/approve`);
  },

  rejectAssignment: async (assignmentId: number) => {
    await apiClient.post(`/assignments/${assignmentId}/reject`);
  },

  /* ───────── QR(사업장) ───────── */
  
  fetchStoreQr: async (storeId: number, refresh = false) => {
    const res = await apiClient.get(`/store/${storeId}/qr`, {
      params: { refresh },
    });
    return res.data;
  },

  
};