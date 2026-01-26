import { apiClient } from "@/shared/api/apiClient";
import type { ProfitBenchmarkResponse } from "./profitBenchmarkTypes";

export const profitBenchmarkApi = {
  getMonthly: async (params: {
    storeId: number;
    year: number;
    month: number;
    myCogsRate?: number; // optional
  }): Promise<ProfitBenchmarkResponse> => {
    const { data } = await apiClient.get<ProfitBenchmarkResponse>(
      "/owner/analysis/profit-benchmark",
      { params }
    );
    return data;
  },
};
