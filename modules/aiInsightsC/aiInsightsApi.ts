// src/modules/aiInsightsC/aiInsightsApi.ts
import { apiClient } from "@/shared/api/apiClient";
import type { 
  DemandForecastResponse, 
  MenuGrowthResponse,
  MenuItem, 
  MenuAnalyticsResponse,
  ProfitForecastResponse 
} from "./aiInsightsTypes";
import type { AxiosError } from "axios";

type ApiErrorBody = {
  code?: string;
  message?: string;
  details?: any;
};

export const aiInsightsApi = {
  // ✅ 1. 수요 예측 데이터 조회 (그래프용)
  getDemandForecast: async (storeId: number): Promise<DemandForecastResponse[]> => {
    const { data } = await apiClient.get<DemandForecastResponse[]>(`/ai/insights/${storeId}/forecast`);
    return data;
  },

  // ✅ 2. [신규] 주간 메뉴 트렌드 데이터 조회 (테이블용 - DB 데이터 기반)
  getMenuGrowthStats: async (storeId: number): Promise<MenuGrowthResponse[]> => {
    const { data } = await apiClient.get<MenuGrowthResponse[]>(`/ai/insights/${storeId}/menu-growth`);
    return data;
  },

  // ✅ 3. 메뉴 성과 + 카테고리 비중 (Bar + Pie 차트용)
  getMenuAnalytics: async (params: {
    storeId: number;
    from: string;
    to: string;
  }): Promise<MenuAnalyticsResponse> => {
    const { storeId, from, to } = params;
    // (참고) 백엔드 컨트롤러 경로가 /owner/sales/menu-analytics 라고 가정
    const { data } = await apiClient.get<MenuAnalyticsResponse>(`/owner/sales/menu-analytics`, {
      params: { storeId, from, to },
    });
    return data;
  },

  // ✅ 4. 월 수익 예측
  getProfitForecast: async (
    storeId: number,
    year: number,
    month: number
  ): Promise<ProfitForecastResponse | null> => {
    try {
      const res = await apiClient.get<ProfitForecastResponse>("/owner/ml/profit-forecast", {
        params: { storeId, year, month },
      });
      return res.data;
    } catch (e) {
      const err = e as AxiosError<ApiErrorBody>;
      const code = err.response?.data?.code;
      if (code === "ML_FEATURE_NOT_READY") return null;
      throw e;
    }
  },

  // ✅ 5. 메뉴 아이템 조회 (임시 Mock 유지)
  getMenuItems: async (storeId: number): Promise<MenuItem[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 500);
    });
  },
};