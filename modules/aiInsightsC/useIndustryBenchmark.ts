import { useQuery } from "@tanstack/react-query";
import { industryBenchmarkApi } from "./industryBenchmarkApi";

export function useIndustryCategoryRank(params: {
    industry?: string;
    periodDays?: number;
    top?: number;
}) {
    const { industry, periodDays = 30, top = 10 } = params;

    return useQuery({
        queryKey: ["industryCategoryRank", industry, periodDays, top],
        queryFn: () =>
            industryBenchmarkApi.getCategoryRank({ industry: industry!, periodDays, top }),
        enabled: !!industry,
        staleTime: 1000 * 60 * 10,
    });
}

export function useIndustrySubCategoryRank(params: {
    industry?: string;
    categoryName?: string;
    periodDays?: number;
    top?: number;
}) {
    const { industry, categoryName, periodDays = 30, top = 5 } = params;

    return useQuery({
        queryKey: ["industrySubCategoryRank", industry, categoryName, periodDays, top],
        queryFn: () =>
            industryBenchmarkApi.getSubCategoryRank({
                industry: industry!,
                categoryName: categoryName!,
                periodDays,
                top,
            }),
        enabled: !!industry && !!categoryName,
        staleTime: 1000 * 60 * 10,
    });
}



