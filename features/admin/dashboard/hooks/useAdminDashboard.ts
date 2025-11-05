"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../adminDashboardService";

export function useAdminDashboard() {
    const {
        data: statsData,
        isLoading: isStatsLoading,
        error: statsError,
    } = useQuery({
        queryKey: ["adminDashboardStats"],
        queryFn: getDashboardStats,
    });

    return {
        statsData,
        isStatsLoading,
        statsError,
    };
}