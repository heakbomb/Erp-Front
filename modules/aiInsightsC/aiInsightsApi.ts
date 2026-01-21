// src/modules/aiInsightsC/aiInsightsApi.ts
import { apiClient } from "@/shared/api/apiClient";
import { DemandForecastResponse, MenuItem, MenuAnalyticsResponse } from "./aiInsightsTypes";
import type { ProfitForecastResponse } from "./aiInsightsTypes"

export const aiInsightsApi = {
  // ✅ 1. 수요 예측 데이터 조회 (실제 백엔드 연동)
  getDemandForecast: async (storeId: number): Promise<DemandForecastResponse[]> => {
    const { data } = await apiClient.get<DemandForecastResponse[]>(`/ai/insights/${storeId}/forecast`);
    return data;
  },
  // ✅ [신규] 메뉴 성과 + 카테고리 비중 (Bar + Pie)
  getMenuAnalytics: async (params: {
    storeId: number;
    from: string; // "YYYY-MM-DD"
    to: string;   // "YYYY-MM-DD"
  }): Promise<MenuAnalyticsResponse> => {
    const { storeId, from, to } = params;

    // ✅ 백엔드 경로는 네 컨트롤러 매핑에 맞춰 조정
    // 예: /owner/sales/menu-analytics 또는 /sales/menu-analytics 등
    const { data } = await apiClient.get<MenuAnalyticsResponse>(`/owner/sales/menu-analytics`, {
      params: { storeId, from, to },
    });
    return data;
  },

 
  getProfitForecast: async (storeId: number, year: number, month: number) => {
    const res = await apiClient.get<ProfitForecastResponse>("/owner/ml/profit-forecast", {
      params: { storeId, year, month },
    })
    return res.data
  },

  

  // ✅ 2. 메뉴 아이템 조회 (usePriceOpt에서 사용 - 에러 방지용 복구)
  // 추후 백엔드에 가격 최적화 전용 API가 생기면 그쪽으로 연결해야 합니다.
  // 현재는 기존처럼 동작하도록 Mock 데이터나 빈 배열을 반환하거나, 기존 로직을 유지합니다.
  getMenuItems: async (storeId: number): Promise<MenuItem[]> => {
    // 백엔드 API가 있다면: 
    // const { data } = await apiClient.get(`/api/erp/menu/optimization/${storeId}`);
    // return data;

    // 우선 컴파일 에러 해결을 위한 임시 Mock 데이터 반환
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          
        ]);
      }, 500);
    });
  },
};