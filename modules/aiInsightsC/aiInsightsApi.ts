// src/modules/aiInsightsC/aiInsightsApi.ts
import { apiClient } from "@/shared/api/apiClient";
import { DemandForecastResponse, MenuItem } from "./aiInsightsTypes";

export const aiInsightsApi = {
  // ✅ 1. 수요 예측 데이터 조회 (실제 백엔드 연동)
  getDemandForecast: async (storeId: number): Promise<DemandForecastResponse[]> => {
    const { data } = await apiClient.get<DemandForecastResponse[]>(`/ai/insights/${storeId}/forecast`);
    return data;
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
          {
            id: 1,
            name: "제육 정식",
            currentMaterials: [{ name: "돼지고기(앞다리)", cost: 3000, origin: "국내산" }],
            alternativeMaterials: [{ name: "돼지고기(뒷다리)", cost: 2200, origin: "수입산" }],
            currentPrice: 10000,
            currentCost: 4500,
            currentMargin: 55,
            alternativeCost: 3700,
            alternativeMargin: 63,
            suggestedPrice: 10500
          },
          {
            id: 2,
            name: "김치찌개",
            currentMaterials: [{ name: "묵은지", cost: 1500, origin: "국내산" }],
            alternativeMaterials: [{ name: "일반김치", cost: 1000, origin: "중국산" }],
            currentPrice: 9000,
            currentCost: 3000,
            currentMargin: 66,
            alternativeCost: 2500,
            alternativeMargin: 72,
            suggestedPrice: 9000
          }
        ]);
      }, 500);
    });
  },
};