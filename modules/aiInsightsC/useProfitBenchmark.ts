import { useQuery } from "@tanstack/react-query";
import { profitBenchmarkApi } from "./profitBenchmarkApi";

export function useProfitBenchmark(params: {
  storeId?: number;
  year: number;
  month: number;
  myCogsRate?: number;
}) {
  const enabled = !!params.storeId;

  return useQuery({
    queryKey: ["profitBenchmark", params.storeId, params.year, params.month, params.myCogsRate],
    queryFn: () =>
      profitBenchmarkApi.getMonthly({
        storeId: params.storeId!,
        year: params.year,
        month: params.month,
        myCogsRate: params.myCogsRate,
      }),
    enabled,
    staleTime: 60_000,
  });
}
