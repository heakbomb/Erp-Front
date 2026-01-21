"use client";

import { useQuery } from "@tanstack/react-query";
import { aiInsightsApi } from "./aiInsightsApi";
import { useStore } from "@/contexts/StoreContext";

export function useProfitForecast(year: number, month: number) {
  const { currentStoreId } = useStore();

  return useQuery({
    queryKey: ["ownerMlProfitForecast", currentStoreId, year, month],
    queryFn: () => aiInsightsApi.getProfitForecast(currentStoreId as number, year, month),
    enabled: !!currentStoreId && !!year && !!month,
    staleTime: 60_000,
  });
}