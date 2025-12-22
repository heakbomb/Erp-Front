"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "./adminApi";
import type { LogLevel } from "./adminTypes";
import { useSearch } from "@/shared/hooks/useSearch";
import { usePagination } from "@/shared/hooks/usePagination";

export function useAdminLogs() {
  const [levelFilter, setLevelFilter] = useState<LogLevel | "ALL">("ALL");
  
  const pagination = usePagination({ initialPage: 0, initialSize: 20 });
  const search = useSearch({
    onSearch: () => pagination.resetPage(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["adminLogs", pagination.page, levelFilter, search.activeKeyword], // activeKeyword 사용
    queryFn: () => adminApi.getLogs({
      page: pagination.page,
      size: pagination.size,
      level: levelFilter,
      q: search.activeKeyword,
    }),
  });

  return {
    logs: data?.content ?? [],
    totalPages: data?.totalPages ?? 0,
    page: pagination.page,
    setPage: pagination.setPage,
    handlePageChange: pagination.handlePageChange,
    levelFilter,
    setLevelFilter,
    
    searchQuery: search.keyword,
    setSearchQuery: search.handleChange,
    handleKeyDown: search.handleKeyDown, // Enter
    
    isLoading,
  };
}