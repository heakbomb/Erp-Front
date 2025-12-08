// features/owner/dashboard/services/ownerDashboardService.ts
import { apiClient } from "@/lib/api/client"
import { fetchSalesSummary } from "@/features/owner/sales/ownerSalesService"

// ───────────────── 타입 정의 ─────────────────

export type OwnerDashboardStats = {
  todaySales: number
  todaySalesChange: number
  monthSales: number
  monthSalesChange: number
  lowStockCount: number
  workingEmployees: number
  totalEmployees: number
}

export type OwnerAlertSeverity = "info" | "medium" | "high"

export type OwnerAlert = {
  id: string
  title: string
  description: string
  severity: OwnerAlertSeverity
}

export type QuickAction = {
  id: string
  title: string
  description: string
}

export type AiInsight = {
  id: string
  title: string
  description: string
}

export type OwnerDashboardData = {
  stats: OwnerDashboardStats
  alerts: OwnerAlert[]
  quickActions: QuickAction[]
  aiInsights: AiInsight[]
}

// ───────────────── 목 데이터 (알림/빠른작업/AI 인사이트) ─────────────────

export const MOCK_OWNER_DASHBOARD: OwnerDashboardData = {
  stats: {
    todaySales: 0,
    todaySalesChange: 0,
    monthSales: 0,
    monthSalesChange: 0,
    lowStockCount: 0,
    workingEmployees: 0,
    totalEmployees: 0,
  },
  alerts: [
    {
      id: "alert-1",
      title: "재고 부족 품목이 있습니다",
      description: "몇 가지 재고가 안전 재고 아래로 내려갔습니다. 발주를 검토하세요.",
      severity: "medium",
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
      description:
        "최근 4주간 토/일요일 14~17시 매출이 평일 대비 23% 높습니다. 프로모션을 고려해 보세요.",
    },
  ],
}

// ───────────────── 유틸: 증감률 계산 ─────────────────

const calcRate = (curr: number, prev: number) => {
  if (!prev || prev === 0) return 0
  return ((curr - prev) / prev) * 100
}

// ───────────────── 실제 백엔드 연동용 함수 ─────────────────

export async function fetchOwnerDashboard(storeId: number): Promise<OwnerDashboardData> {
  // 1) 매출 요약 + 재고 부족 개수 병렬 호출
  const [summary, lowStockRes] = await Promise.all([
    fetchSalesSummary(storeId), // 이미 매출 관리에서 쓰고 있는 함수
    apiClient.get<number>("/owner/inventory/low-stock-count", {
      params: { storeId },
    }),
  ])

  const lowStockCount = lowStockRes.data

  // 2) stats 조합 (직원 수는 나중에 백엔드 연결)
  const stats: OwnerDashboardStats = {
    todaySales: summary.todaySales,
    todaySalesChange: calcRate(summary.todaySales, summary.yesterdaySales),
    monthSales: summary.thisMonthSales,
    monthSalesChange: calcRate(summary.thisMonthSales, summary.lastMonthSales),
    lowStockCount,
    workingEmployees: 0, // TODO: 직원 쪽 붙일 때 교체
    totalEmployees: 0,   // TODO: 직원 쪽 붙일 때 교체
  }

  return {
    stats,
    alerts: MOCK_OWNER_DASHBOARD.alerts,
    quickActions: MOCK_OWNER_DASHBOARD.quickActions,
    aiInsights: MOCK_OWNER_DASHBOARD.aiInsights,
  }
}
