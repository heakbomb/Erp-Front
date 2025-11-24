// features/owner/sales/ownerSalesService.ts (경로는 네가 가진 그대로)
import { apiClient } from "@/lib/api/client" // 네 프로젝트에서 apiClient export 하는 곳

export type DailySalesDatum = {
  date: string
  sales: number
}

export type TopMenu = {
  name: string
  quantity: number
  revenue: number
  growth: number
}

export type RecentTransaction = {
  id: string
  time: string
  items: string
  amount: number
}

// 상단 카드/테이블용 Mock는 그냥 유지 가능
export const MOCK_TOP_MENUS: TopMenu[] = [/* ... */]
export const MOCK_RECENT_TRANSACTIONS: RecentTransaction[] = [/* ... */]

export async function fetchOwnerSalesDaily(
  storeId: number,
  from: string,
  to: string,
): Promise<DailySalesDatum[]> {
  const res = await apiClient.get<DailySalesDatum[]>("/owner/sales/daily", {
    params: { storeId, from, to },
  })
  return res.data
}
