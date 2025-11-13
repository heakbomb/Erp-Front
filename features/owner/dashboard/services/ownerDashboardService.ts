// features/owner/dashboard/services/ownerDashboardService.ts
import { apiClient } from "@/lib/api/client"; // ✅ apiClient 사용

export type OwnerDashboardStats = {
  todaySales: number;
  todaySalesChange: number;
  monthSales: number;
  monthSalesChange: number;
  lowStockCount: number;
  workingEmployees: number;
  totalEmployees: number;
};

export type OwnerAlert = {
  id: string;
  level: "info" | "warning" | "danger" | "primary";
  title: string;
  description: string;
};

export type QuickAction = {
  id: string;
  title: string;
  description: string;
};

export type AiInsight = {
  id: string;
  title: string;
  description: string;
};

export type OwnerDashboardData = {
  stats: OwnerDashboardStats;
  alerts: OwnerAlert[];
  quickActions: QuickAction[];
  aiInsights: AiInsight[];
};

// ───── 목 데이터 (현재 화면 그대로 반영) ─────
export const MOCK_OWNER_DASHBOARD: OwnerDashboardData = {
  stats: {
    todaySales: 1_234_000,
    todaySalesChange: 12.5,
    monthSales: 28_450_000,
    monthSalesChange: 8.2,
    lowStockCount: 5,
    workingEmployees: 8,
    totalEmployees: 12,
  },
  alerts: [
    {
      id: "raw-price-up",
      level: "warning",
      title: "원자재 가격 상승",
      description: "커피 원두 가격이 8% 상승했습니다. 메뉴 가격 조정을 검토하세요.",
    },
    {
      id: "pending-employees",
      level: "primary",
      title: "직원 신청 대기",
      description: "3명의 직원이 사업장 가입을 신청했습니다.",
    },
    {
      id: "low-stock",
      level: "danger",
      title: "재고 부족",
      description: "5개 품목이 안전 재고 수준 이하입니다. 발주가 필요합니다.",
    },
  ],
  quickActions: [
    {
      id: "add-sales",
      title: "매출 기록 추가",
      description: "오늘의 매출을 기록하세요",
    },
    {
      id: "check-stock",
      title: "재고 확인",
      description: "현재 재고 현황을 확인하세요",
    },
    {
      id: "check-attendance",
      title: "직원 출결 확인",
      description: "오늘의 출결 현황을 확인하세요",
    },
  ],
  aiInsights: [
    {
      id: "demand-forecast",
      title: "수요 예측",
      description: "이번 주말 방문객이 평소보다 20% 증가할 것으로 예상됩니다.",
    },
    {
      id: "price-optimization",
      title: "가격 최적화",
      description: "아메리카노 가격을 4,800원으로 조정하면 마진율 25.5%를 유지할 수 있습니다.",
    },
  ],
};

// ───── 나중에 실제 API 붙일 때 여기만 바꾸면 됨 ─────
export async function fetchOwnerDashboard(): Promise<OwnerDashboardData> {
  // TODO: 백엔드 연동되면 axios.get으로 교체
  // const res = await apiClient.get<OwnerDashboardData>(`/api/owner/dashboard`); // ✅ apiClient 사용
  // return res.data;

  // 지금은 화면용 목데이터 리턴
  return MOCK_OWNER_DASHBOARD;
}