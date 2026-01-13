// modules/salesC/salesApi.ts
import { apiClient } from "@/shared/api/apiClient";
import type { PageResponse } from "@/shared/types/api";
import type { WeeklyAreaAvgResponse } from "./salesTypes"

import type {
  SalesSummaryResponse,
  DailySalesDatum,
  TopMenu,
  TransactionSummary,
  PosMenuItem,
  PosOrderRequest,
  PosOrderResponse,
  MonthlyReport
} from "./salesTypes";

export const salesApi = {
  // --- 대시보드 ---

  // 매출 요약 조회
  fetchSalesSummary: async (storeId: number) => {
    const res = await apiClient.get<SalesSummaryResponse>(`/owner/sales/summary`, {
      params: { storeId },
    });
    return res.data;
  },

  // 일별/기간별 매출 조회
  fetchDailySales: async (storeId: number, from: string, to: string) => {
    const res = await apiClient.get<DailySalesDatum[]>(`/owner/sales/daily`, {
      params: { storeId, from, to },
    });
    return res.data;
  },

  // 인기 메뉴 조회
  fetchTopMenus: async (storeId: number, from: string, to: string) => {
    const res = await apiClient.get<TopMenu[]>(`/owner/sales/top-menus`, {
      params: { storeId, from, to },
    });
    return res.data;
  },

  // 거래 내역 조회
  fetchTransactions: async (storeId: number, from: string, to: string, page: number, size: number) => {
    const res = await apiClient.get<PageResponse<TransactionSummary>>(`/owner/sales/transactions`, {
      params: { storeId, from, to, page, size, sort: "transactionTime,desc" },
    });
    return res.data;
  },

  // 결제 취소 (환불)
  refundTransaction: async (body: { transactionId: number; isWaste: boolean; reason: string }) => {
    await apiClient.post(`/owner/sales/transactions/${body.transactionId}/refund`, body);
  },

  // --- POS ---

  // POS용 메뉴 조회
  getPosMenus: async (storeId: number) => {
    const res = await apiClient.get<PosMenuItem[]>("/owner/menu/pos", {
      params: { storeId },
    });
    return res.data;
  },

  // POS 주문 생성
  createPosOrder: async (body: PosOrderRequest) => {
    const res = await apiClient.post<PosOrderResponse>("/owner/sales/pos-order", body);
    return res.data;
  },

  // --- 리포트 ---

  // 월간 리포트 조회
  getMonthlyReport: async (storeId: number, year: number, month: number) => {
    const res = await apiClient.get<MonthlyReport>(`/owner/sales/stores/${storeId}/reports/monthly`, {
      params: { year, month },
    });
    return res.data;
  },

  getWeeklyAreaAvg: async (storeId: number, year: number, month: number) => {
    const res = await apiClient.get<WeeklyAreaAvgResponse>("/owner/sales/weekly-area-avg", {
      params: { storeId, year, month },
    })
    console.log("weeklyAreaAvg raw:", res)
    console.log("weeklyAreaAvg data:", res.data)
    return res.data
  },
};