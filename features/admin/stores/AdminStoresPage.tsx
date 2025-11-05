"use client"

import React, { useState } from "react";
// ⭐️ shadcn/ui 컴포넌트 임포트 (경로 수정)
import { Check, Loader2, Search, X } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "../../../components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

// ⭐️ 훅 임포트
import type { Store } from "../../../lib/types/database"; // ⭐️ Store 타입
import { useAdminStores } from "./hooks/useAdminStores";

// ⭐️ AdminStoresPage 'Feature' 컴포넌트
export default function AdminStoresPageFeature() {
  // ✅ 1. Hydration Mismatch 방지를 위한 'mounted' state
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => { setMounted(true) }, []);

  // 2. 훅 호출
  const {
    storesData,
    isStoresLoading,
    storesError,
    page,
    totalPages,
    handlePageChange,
    tab,
    handleTabChange,
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleApprove,
    handleReject,
    isUpdatingStatus,
  } = useAdminStores();

  const items = storesData?.content ?? [];
  const error = storesError as Error | null;

  // ✅ 3. 'mounted'가 false일 때 스켈레톤 UI 반환
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">사업장 승인 관리</h1>
            <p className="text-muted-foreground">
              신규 등록된 사업장을 승인 또는 반려합니다.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex space-x-4 border-b">
            <div className="h-10 px-4 py-2 bg-gray-200 rounded-t-md animate-pulse w-24 dark:bg-gray-700"></div>
            <div className="h-10 px-4 py-2 bg-gray-200 rounded-t-md animate-pulse w-24 dark:bg-gray-700"></div>
            <div className="h-10 px-4 py-2 bg-gray-200 rounded-t-md animate-pulse w-24 dark:bg-gray-700"></div>
            <div className="h-10 px-4 py-2 bg-gray-200 rounded-t-md animate-pulse w-24 dark:bg-gray-700"></div>
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-32 dark:bg-gray-700"></div>
                <div className="flex gap-2">
                  <div className="h-10 bg-gray-200 rounded animate-pulse w-64 dark:bg-gray-700"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse w-10 dark:bg-gray-700"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 4. 공통 테이블 컨텐츠 ('mounted'가 true일 때만 실행)
  const StoresTableContent = (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>사업장 목록</CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="사업장명, 사업자번호 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              className="w-64"
            />
            <Button onClick={handleSearch}><Search className="h-4 w-4" /></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isStoresLoading && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
        {error && <div className="text-red-500 text-center p-4">{error.message}</div>}

        {!isStoresLoading && !error && (
          <>
            {/* ✅ [수정] Table, TableHeader, TableBody 사이의 모든 줄바꿈을 제거합니다. */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store ID</TableHead>
                  <TableHead>사업장명</TableHead>
                  <TableHead>업종</TableHead>
                  <TableHead>POS 공급사</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow></TableHeader><TableBody>
                {/* 데이터가 없을 때 */}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
                {/* 데이터가 있을 때 (items.length > 0) */}
                {items.map((store: Store) => (
                  <TableRow key={store.storeId}>
                    <TableCell>{store.storeId}</TableCell>
                    <TableCell className="font-medium">{store.storeName}</TableCell>
                    <TableCell>{store.industry}</TableCell>
                    <TableCell>{store.posVendor ?? "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={
                        store.status === "APPROVED" ? "default" :
                          store.status === "PENDING" ? "secondary" : "destructive"
                      }>
                        {store.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {store.status !== "APPROVED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApprove(store.storeId)}
                            disabled={isUpdatingStatus}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {store.status !== "REJECTED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReject(store.storeId)}
                            disabled={isUpdatingStatus}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody></Table>

            {/* Pagination (기존과 동일) */}
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }}
                    className={!isStoresLoading && page > 0 ? "" : "pointer-events-none opacity-50"}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4 py-2 text-sm">
                    Page {totalPages > 0 ? page + 1 : 0} of {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }}
                    className={!isStoresLoading && page < totalPages - 1 ? "" : "pointer-events-none opacity-50"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </>
        )}
      </CardContent>
    </Card>
  );

  // ✅ 6. 'mounted'가 true일 때만 실제 UI를 렌더링합니다.
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">사업장 승인 관리</h1>
          <p className="text-muted-foreground">
            신규 등록된 사업장을 승인 또는 반려합니다.
          </p>
        </div>
      </div>

      <Tabs value={tab} className="space-y-4" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="PENDING">승인 대기</TabsTrigger>
          <TabsTrigger value="APPROVED">승인 완료</TabsTrigger>
          <TabsTrigger value="REJECTED">반려</TabsTrigger>
          <TabsTrigger value="ALL">전체 보기</TabsTrigger>
        </TabsList>

        <TabsContent value="PENDING">{StoresTableContent}</TabsContent>
        <TabsContent value="APPROVED">{StoresTableContent}</TabsContent>
        <TabsContent value="REJECTED">{StoresTableContent}</TabsContent>
        <TabsContent value="ALL">{StoresTableContent}</TabsContent>
      </Tabs>
    </div>
  );
}