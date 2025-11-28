// features/owner/sales/ownerSalesService.ts
import { apiClient } from "@/lib/api/client"
import { PageResponse } from "@/lib/types/api"

// ✅ [수정] 백엔드 DTO와 일치시킴
export type SalesSummaryResponse = {
  todaySales: number
  yesterdaySales: number
  
  thisWeekSales: number
  lastWeekSales: number
  
  thisMonthSales: number
  lastMonthSales: number
  
  avgTicket: number
  prevAvgTicket: number
}

export type DailySalesDatum = {
  date: string
  sales: number
}

// ✅ [수정] share(비중) 필드 추가
export type TopMenu = {
  menuId: number
  name: string      // 백엔드가 'menuName'으로 주면 매핑 필요
  quantity: number
  revenue: number
  share?: number    // 프론트에서 계산할 필드
}

export type TransactionStatus = "PAID" | "CANCELED"

export type TransactionSummary = {
  transactionId: number
  transactionTime: string
  paymentMethod: string
  status: TransactionStatus 
  totalAmount: number
  totalDiscount: number
  itemsSummary: string
}

export type RefundRequest = {
  transactionId: number
  isWaste: boolean
  reason: string
}

// --- API 함수 ---

export async function fetchSalesSummary(storeId: number) {
  const res = await apiClient.get<SalesSummaryResponse>("/owner/sales/summary", {
    params: { storeId },
  })
  return res.data
}

export async function fetchDailySales(storeId: number, from: string, to: string) {
  const res = await apiClient.get<DailySalesDatum[]>("/owner/sales/daily", {
    params: { storeId, from, to },
  })
  return res.data
}

export async function fetchTopMenus(storeId: number, from: string, to: string) {
  // 백엔드 응답은 any[]로 받아서 훅에서 가공할 예정
  const res = await apiClient.get<any[]>("/owner/sales/top-menus", {
    params: { storeId, from, to },
  })
  return res.data
}

export async function fetchTransactions(
  storeId: number, 
  from: string, 
  to: string, 
  page: number, 
  size: number
) {
  const res = await apiClient.get<PageResponse<TransactionSummary>>("/owner/sales/transactions", {
    params: { storeId, from, to, page, size, sort: "transactionTime,desc" },
  })
  return res.data
}

export async function refundTransaction(data: RefundRequest) {
  const res = await apiClient.post("/owner/sales/refund", data)
  return res.data
}