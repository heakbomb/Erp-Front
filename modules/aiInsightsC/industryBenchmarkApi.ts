import { apiClient } from "@/shared/api/apiClient";
import type {
  IndustryCategoryRankItem,
  IndustrySubCategoryRankItem
} from "./industryBenchmarkTypes";

export const industryBenchmarkApi = {
  // 업종 선택 → 중분류 랭킹 TOP N
  getCategoryRank: async (params: {
    industry: string;
    periodDays?: number; // default 30
    top?: number;        // default 10
  }): Promise<IndustryCategoryRankItem[]> => {
    const { industry, periodDays = 30, top = 10 } = params;
    const { data } = await apiClient.get<IndustryCategoryRankItem[]>(
      `/owner/benchmark/industry/category-rank`,
      { params: { industry, periodDays, top } }
    );
    return data;
  },

  getSubCategoryRank: async (params: {
  industry: string;
  categoryName: string;
  periodDays?: number;
  top?: number;
}): Promise<IndustrySubCategoryRankItem[]> => {
  const { industry, categoryName, periodDays = 30, top = 5 } = params;
  const { data } = await apiClient.get<IndustrySubCategoryRankItem[]>(
    `/owner/benchmark/industry/subcategory-rank`,
    { params: { industry, categoryName, periodDays, top } }
  );
  return data;
},

};
