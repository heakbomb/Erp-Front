"use client";

import { useQuery } from "@tanstack/react-query";
import { aiInsightsApi } from "./aiInsightsApi";
import { useStore } from "@/contexts/StoreContext";
import type { ProfitForecastResponse } from "./aiInsightsTypes";

export function useProfitForecast(year: number, month: number) {
  const { currentStoreId } = useStore();

  const enabled = !!currentStoreId && year > 0 && month > 0;

  return useQuery<ProfitForecastResponse | null>({
    queryKey: ["ownerMlProfitForecast", currentStoreId, year, month],
    queryFn: () => {
      // enabled=false면 호출 안 되지만, 혹시 몰라서 방어
      if (!currentStoreId) return Promise.resolve(null);
      return aiInsightsApi.getProfitForecast(currentStoreId, year, month);
    },
    enabled,
    staleTime: 60_000,
    retry: (failureCount, error: any) => {
      // getProfitForecast에서 NOT_READY는 null로 처리되어 여기로 안 옴
      // 나머지는 2번까지만 재시도
      return failureCount < 2;
    },
  });
}
