// shared/hooks/usePagination.ts
"use client";

import { useState, useCallback } from "react";

interface UsePaginationProps {
  initialPage?: number;
  initialSize?: number;
}

export function usePagination({ initialPage = 0, initialSize = 10 }: UsePaginationProps = {}) {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);

  // 페이지 변경 (음수 방지)
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 0) return;
    setPage(newPage);
  }, []);

  // 페이지 사이즈 변경 (사이즈가 바뀌면 보통 1페이지로 돌아감)
  const handleSizeChange = useCallback((newSize: number) => {
    setSize(newSize);
    setPage(0);
  }, []);

  // 페이지 초기화 (검색 시 주로 사용)
  const resetPage = useCallback(() => {
    setPage(0);
  }, []);

  return {
    page,
    size,
    setPage,
    setSize,
    handlePageChange,
    handleSizeChange,
    resetPage,
  };
}