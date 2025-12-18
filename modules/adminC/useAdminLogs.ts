// src/modules/admin/useAdminLogs.ts
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "./adminApi";
import type { LogLevel } from "./adminTypes";

export function useAdminLogs() {
  const [page, setPage] = useState(0);
  const [levelFilter, setLevelFilter] = useState<LogLevel | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["adminLogs", page, levelFilter, searchQuery],
    queryFn: () => adminApi.getLogs({
      page,
      size: pageSize,
      level: levelFilter,
      q: searchQuery,
    }),
  });

  return {
    logs: data?.content ?? [],
    totalPages: data?.totalPages ?? 0,
    page,
    setPage,
    levelFilter,
    setLevelFilter,
    searchQuery,
    setSearchQuery,
    isLoading,
  };
}