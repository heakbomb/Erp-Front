import { apiClient } from "@/lib/api/client"; // ✅ apiClient 사용

// ===== Types =====
export type DailySalesDatum = {
  date: string;
  sales: number;
};

export type TopMenu = {
  name: string;
  quantity: number;
  revenue: number;
  growth: number;
};

export type RecentTransaction = {
  id: string;
  time: string;
  items: string;
  amount: number;
};

export type OwnerSalesData = {
  dailySalesData: DailySalesDatum[];
  topMenus: TopMenu[];
  recentTransactions: RecentTransaction[];
};

// ===== Mock Data (현재 page.tsx에 있던 하드코딩 그대로 이동) =====
export const MOCK_DAILY_SALES_DATA: DailySalesDatum[] = [
  { date: "04/14", sales: 850000 },
  { date: "04/15", sales: 920000 },
  { date: "04/16", sales: 780000 },
  { date: "04/17", sales: 1050000 },
  { date: "04/18", sales: 980000 },
  { date: "04/19", sales: 1120000 },
  { date: "04/20", sales: 1234000 },
];

export const MOCK_TOP_MENUS: TopMenu[] = [
  { name: "아메리카노", quantity: 145, revenue: 652500, growth: 12.5 },
  { name: "카페라떼", quantity: 98, revenue: 490000, growth: 8.3 },
  { name: "카푸치노", quantity: 76, revenue: 380000, growth: -2.1 },
  { name: "치즈케이크", quantity: 45, revenue: 292500, growth: 15.2 },
  { name: "딸기 스무디", quantity: 32, revenue: 192000, growth: 5.7 },
];

export const MOCK_RECENT_TRANSACTIONS: RecentTransaction[] = [
  { id: "TXN-001", time: "14:35", items: "아메리카노 x2, 치즈케이크 x1", amount: 15500 },
  { id: "TXN-002", time: "14:28", items: "카페라떼 x1", amount: 5000 },
  { id: "TXN-003", time: "14:15", items: "아메리카노 x1, 카푸치노 x1", amount: 9500 },
  { id: "TXN-004", time: "14:02", items: "딸기 스무디 x2", amount: 12000 },
  { id: "TXN-005", time: "13:55", items: "아메리카노 x3", amount: 13500 },
];

// ===== API (나중에 실제 백엔드 붙일 때 여기만 바꾸면 됨) =====
export async function fetchOwnerSales(): Promise<OwnerSalesData> {
  // 실제 연동 시:
  // const res = await apiClient.get<OwnerSalesData>(`/api/owner/sales`); // ✅ apiClient 사용
  // return res.data;

  // 지금은 목데이터 반환
  return {
    dailySalesData: MOCK_DAILY_SALES_DATA,
    topMenus: MOCK_TOP_MENUS,
    recentTransactions: MOCK_RECENT_TRANSACTIONS,
  };
}