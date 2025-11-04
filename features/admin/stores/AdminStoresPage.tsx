// features/admin/stores/AdminStoresPage.tsx
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
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => { setMounted(true) }, []);

  // 1. 훅 호출
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

  // 2. 공통 테이블 컨텐츠
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store ID</TableHead>
                  <TableHead>사업장명</TableHead>
                  <TableHead>업종</TableHead>
                  <TableHead>POS 공급사</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length > 0 ? (
                  items.map((store: Store) => (
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
                        {/* ⭐️ 승인 대기 상태일 때만 버튼 노출 */}
                        <div className="flex justify-end gap-1">
                                
                                {/* 1. '승인' 버튼: APPROVED 상태가 아닐 때 (즉, PENDING 또는 REJECTED일 때) 보임 */}
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

                                {/* 2. '반려' 버튼: REJECTED 상태가 아닐 때 (즉, PENDING 또는 APPROVED일 때) 보임 */}
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {/* Pagination */}
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