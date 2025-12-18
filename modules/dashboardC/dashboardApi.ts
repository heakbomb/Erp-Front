// modules/dashboardC/dashboardApi.ts
import { apiClient } from "@/shared/api/apiClient";
import type {
  AdminDashboardStats,
  OwnerDashboardData,
  OwnerDashboardStats,
  EmployeeDashboardData,
  EmployeeStatusSummary // 내부 타입 혹은 any 처리
} from "./dashboardTypes";

// [Owner] 증감률 계산 유틸
const calcRate = (curr: number, prev: number) => {
  if (!prev || prev === 0) return 0;
  return ((curr - prev) / prev) * 100;
};

// [Owner] Mock 데이터
const MOCK_OWNER_DATA = {
  alerts: [
    {
      id: "alert-1",
      title: "재고 부족 품목이 있습니다",
      description: "몇 가지 재고가 안전 재고 아래로 내려갔습니다. 발주를 검토하세요.",
      severity: "medium" as const,
    },
  ],
  quickActions: [
    {
      id: "qa-1",
      title: "오늘 매출 상세 보기",
      description: "오늘 발생한 거래 내역과 인기 메뉴를 확인합니다.",
    },
    {
      id: "qa-2",
      title: "재고 관리로 이동",
      description: "안전 재고 미달 품목을 확인하고 발주를 생성합니다.",
    },
  ],
  aiInsights: [
    {
      id: "ai-1",
      title: "주말 오후 시간대 매출 상승",
      description: "최근 4주간 토/일요일 14~17시 매출이 평일 대비 23% 높습니다. 프로모션을 고려해 보세요.",
    },
  ],
};

// [Employee] Mock 데이터
export const MOCK_EMPLOYEE_DATA: EmployeeDashboardData = {
  currentWorkplace: "김사장님의 카페",
  quickStats: {
    todayWorkTime: "5시간 30분",
    todayStartTime: "09:00 출근",
    monthWorkDays: "18일",
    monthWorkHours: "총 144시간",
    expectedSalary: "₩1,440,000",
    hourlyWage: "시급 ₩10,000",
    workStatus: "근무중",
    expectedLeaveTime: "퇴근 예정 18:00",
  },
  recentRecords: [
    { date: "2024-04-19", start: "09:00", end: "18:00", hours: "8시간" },
    { date: "2024-04-18", start: "09:00", end: "18:00", hours: "8시간" },
    { date: "2024-04-17", start: "09:15", end: "18:00", hours: "7시간 45분" },
    { date: "2024-04-16", start: "09:00", end: "17:30", hours: "7시간 30분" },
  ],
};

export const dashboardApi = {
  // 1. 관리자 대시보드 (features/admin/dashboard/adminDashboardService.ts)
  getAdminDashboardStats: async () => {
    const res = await apiClient.get<AdminDashboardStats>("/admin/dashboard/stats");
    return res.data;
  },

  // 2. 사장님 대시보드 (features/owner/dashboard/services/ownerDashboardService.ts)
  getOwnerDashboard: async (storeId: number) => {
    // Sales Summary 직접 호출 (modules/salesC 의존성 제거 혹은 직접 구현)
    // features는 ownerSalesService에서 fetchSalesSummary를 가져오지만, 여기선 API 직접 호출로 처리
    const [summaryRes, lowStockRes, employeeStatusRes] = await Promise.all([
      apiClient.get<any>("/owner/sales/summary", { params: { storeId } }),
      apiClient.get<number>("/owner/inventory/low-stock-count", { params: { storeId } }),
      apiClient.get<any>("/owner/attendance/status", { params: { storeId } }),
    ]);

    const summary = summaryRes.data;
    const lowStockCount = lowStockRes.data;
    const { workingCount, totalCount } = employeeStatusRes.data;

    const stats: OwnerDashboardStats = {
      todaySales: summary.todaySales,
      todaySalesChange: calcRate(summary.todaySales, summary.yesterdaySales),
      monthSales: summary.thisMonthSales,
      monthSalesChange: calcRate(summary.thisMonthSales, summary.lastMonthSales),
      lowStockCount,
      workingEmployees: workingCount,
      totalEmployees: totalCount,
    };

    return {
      stats,
      ...MOCK_OWNER_DATA,
    } as OwnerDashboardData;
  },

  // 3. 직원 대시보드 (features/employee/dashboard/services/dashboardService.ts)
  // 현재 Mock Data 반환
  getEmployeeDashboard: async () => {
    return MOCK_EMPLOYEE_DATA;
  }
};