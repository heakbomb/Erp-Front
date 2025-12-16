"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useInquiries } from "../hooks/useInquiries";
import { InquiryList } from "./InquiryList";
import { InquiryCreateDialog } from "./InquiryCreateDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { Button } from "@/shared/ui/button";

// 한 번에 보여줄 페이지 번호 개수 (예: 1 2 3 4 5)
const PAGE_WINDOW = 5;

export function InquiryView() {
  const { user } = useAuth();
  const ownerId = user && user.role === 'OWNER' ? user.owner_id : undefined;

  // [추가] 페이지 상태 관리
  const [page, setPage] = useState(0);

  // [수정] page 파라미터 전달 및 totalPages, totalElements 수신
  const { 
    inquiries, 
    totalPages, 
    totalElements, 
    isLoading, 
    createInquiry, 
    isCreating, 
    deleteInquiry 
  } = useInquiries(ownerId, page);

  // 로그인 안 했거나 사장님이 아닌 경우 처리
  if (!user || user.role !== 'OWNER' || !ownerId) {
    return <div className="p-8 text-center">로그인이 필요한 서비스입니다.</div>;
  }

  // [추가] 페이지 이동 핸들러
  const handlePageChange = (p: number) => {
    if (p >= 0 && p < totalPages) {
      setPage(p);
    }
  };

  // [추가] 페이지네이션 계산 (InventoryPage/MenuPage 로직 참조)
  const start = Math.floor(page / PAGE_WINDOW) * PAGE_WINDOW;
  const end = Math.min(start + PAGE_WINDOW - 1, Math.max(totalPages - 1, 0));

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">1:1 문의</h2>
            <p className="text-muted-foreground mt-1">
                시스템 이용 중 궁금한 점이나 불편사항을 문의해주세요.
            </p>
        </div>
        <InquiryCreateDialog 
            ownerId={ownerId} 
            onCreate={async (data) => {
              await createInquiry(data);
              // [추가] 등록 후 1페이지로 이동
              setPage(0);
            }} 
            isCreating={isCreating} 
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>문의 내역</CardTitle>
          <CardDescription>총 {totalElements}건의 문의가 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="space-y-3">
               <Skeleton className="h-12 w-full" />
               <Skeleton className="h-12 w-full" />
               <Skeleton className="h-12 w-full" />
             </div>
          ) : (
            <>
              <InquiryList inquiries={inquiries} onDelete={deleteInquiry} />

              {/* [추가] 페이지네이션 UI (다른 페이지 양식 참조) */}
              {totalPages > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    페이지 {page + 1} / {Math.max(totalPages, 1)}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={page === 0} 
                      onClick={() => handlePageChange(0)}
                    >
                      « 처음
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={page <= 0} 
                      onClick={() => handlePageChange(page - 1)}
                    >
                      ‹ 이전
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) => (
                        <Button
                          key={p}
                          variant={p === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(p)}
                        >
                          {p + 1}
                        </Button>
                      ))}
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={page >= totalPages - 1} 
                      onClick={() => handlePageChange(page + 1)}
                    >
                      다음 ›
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={page >= totalPages - 1} 
                      onClick={() => handlePageChange(totalPages - 1)}
                    >
                      마지막 »
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}