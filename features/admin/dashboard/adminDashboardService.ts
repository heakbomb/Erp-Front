import { apiClient } from "@/shared/api/apiClient";
import { ApiErrorResponse } from "@/shared/types/api";

// ✅ [복원] AuditLog 타입
type AuditLog = {
    auditId: number;
    userId: number;
    userType: string;
    actionType: string;
    targetTable: string;
    createdAt: string;
};

// ✅ 백엔드 DashboardStatsResponse DTO와 일치
export type DashboardStats = {
    totalStores: number;
    totalUsers: number;
    activeSubscriptions: number;    
    pendingStoreCount: number;      
    pendingInquiryCount: number;

    recentActivities: AuditLog[]; 
};

/**
 * (Admin) 대시보드 통계 데이터 조회
 * GET /admin/dashboard/stats
 */
export const getDashboardStats = async () => {
    const res = await apiClient.get<DashboardStats>("/admin/dashboard/stats");
    return res.data;
};