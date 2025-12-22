// modules/salesC/useSalesReport.ts
"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/contexts/StoreContext";
import { salesApi } from "./salesApi";
import type { MonthlyReport } from "./salesTypes";

interface Props {
  year: number;
  month: number;
}

export default function useSalesReport({ year, month }: Props) {
  const { currentStoreId } = useStore();
  const [data, setData] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!currentStoreId || !year || !month) return;
    const fetchReport = async () => {
      try {
        setLoading(true); setError(null);
        const res = await salesApi.getMonthlyReport(currentStoreId, year, month);
        setData(res);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [currentStoreId, year, month]);

  return { data, loading, error, currentStoreId };
}