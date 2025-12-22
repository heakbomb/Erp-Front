"use client";

import { Button } from "@/shared/ui/button";

interface CommonPaginationProps {
  page: number;         // 현재 페이지 (0-based index)
  totalPages: number;   // 전체 페이지 수
  onPageChange: (page: number) => void; // 페이지 변경 핸들러
  pageWindow?: number;  // 한 번에 보여줄 페이지 번호 개수 (기본 5)
}

export function CommonPagination({
  page,
  totalPages,
  onPageChange,
  pageWindow = 5,
}: CommonPaginationProps) {
  // 페이지가 없으면 렌더링하지 않음
  if (totalPages <= 0) return null;

  const start = Math.floor(page / pageWindow) * pageWindow;
  const end = Math.min(start + pageWindow - 1, Math.max(totalPages - 1, 0));

  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        페이지 {page + 1} / {Math.max(totalPages, 1)}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => onPageChange(0)}
        >
          « 처음
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          ‹ 이전
        </Button>
        {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) => (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(p)}
          >
            {p + 1}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          다음 ›
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(totalPages - 1)}
        >
          마지막 »
        </Button>
      </div>
    </div>
  );
}