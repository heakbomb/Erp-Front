"use client"

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query"; 
import { apiClient } from "@/lib/api/client"; 
import { 
  Check, Loader2, Search, X, MoreVertical, Eye, 
  MapPin, Phone, Mail, Store as StoreIcon, User, Users, Calendar, Clock 
} from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/shared/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Separator } from "@/shared/ui/separator";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/shared/ui/dialog";

import { useAdminStores } from "./hooks/useAdminStores";
import type { Store } from "@/shared/types/database";

// ⭐️ [수정] StoreDetail 인터페이스 수정
// Store에 이미 approvedAt이 존재하므로 여기서 중복 정의를 제거하여 충돌 방지
interface StoreDetail extends Store {
  bizNum?: string | null;
  phone?: string | null;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  // approvedAt 제거 (Store에서 상속받음)
  employees?: {
    name: string;
    role: string;
    status: string;
  }[];
}

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
};

const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  });
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "APPROVED": return "default";
    case "PENDING": return "secondary";
    case "REJECTED": return "destructive";
    default: return "outline";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "APPROVED": return "운영중";
    case "PENDING": return "승인 대기";
    case "REJECTED": return "반려됨";
    default: return status;
  }
};

export default function AdminStoresPageFeature() {
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => { setMounted(true) }, []);

  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const {
    storesData, isStoresLoading, storesError,
    page, totalPages, handlePageChange,
    tab, handleTabChange,
    searchQuery, setSearchQuery, handleSearch,
    handleApprove, handleReject
  } = useAdminStores();

  const items = storesData?.content ?? [];
  const error = storesError as Error | null;

  // ⭐️ 상세 데이터 페칭
  const { data: detailData, isLoading: isDetailLoading } = useQuery<StoreDetail>({
    queryKey: ["adminStoreDetail", selectedStoreId],
    queryFn: async () => {
      if (!selectedStoreId) return null;
      const res = await apiClient.get(`/store/${selectedStoreId}`); 
      return res.data;
    },
    enabled: !!selectedStoreId && isDetailOpen, 
  });

  const openDetailModal = (id: number) => {
    setSelectedStoreId(id);
    setIsDetailOpen(true);
  };

  if (!mounted) return null;

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
        {isStoresLoading ? (
           <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead>사업장명</TableHead>
                  <TableHead>사업자번호</TableHead>
                  <TableHead>업종</TableHead>
                  <TableHead>POS 공급사</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                   <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">데이터가 없습니다.</TableCell></TableRow>
                )}
                {/* ⭐️ [수정] approvedAt 제거 (Store에 이미 포함됨), bizNum 타입 명시 */}
                {items.map((store: Store & { bizNum?: string | null }) => (
                  <TableRow key={store.storeId}>
                    <TableCell>{store.storeId}</TableCell>
                    <TableCell className="font-medium">{store.storeName}</TableCell>
                    <TableCell className="font-mono text-muted-foreground text-xs">
                      {store.bizNum || "-"}
                    </TableCell>
                    <TableCell>{store.industry}</TableCell>
                    <TableCell>{store.posVendor ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant={getStatusBadgeVariant(store.status)}>
                          {getStatusLabel(store.status)}
                        </Badge>
                        {/* Store 타입에 approvedAt이 있으므로 바로 접근 가능 */}
                        {store.status === "APPROVED" && store.approvedAt && (
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(store.approvedAt)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>작업 선택</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem onClick={() => openDetailModal(store.storeId)}>
                            <Eye className="mr-2 h-4 w-4" /> 상세 보기
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          
                          {store.status !== "APPROVED" && (
                            <DropdownMenuItem 
                              onClick={() => handleApprove(store.storeId)} 
                              className="text-green-600 focus:text-green-700"
                            >
                              <Check className="mr-2 h-4 w-4" /> 승인 처리
                            </DropdownMenuItem>
                          )}

                          {store.status !== "REJECTED" && (
                            <DropdownMenuItem 
                              onClick={() => handleReject(store.storeId)} 
                              className="text-red-600 focus:text-red-700"
                            >
                              <X className="mr-2 h-4 w-4" /> 반려 처리
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <Pagination className="mt-4">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious href="#" onClick={(e) => {e.preventDefault(); handlePageChange(page-1)}} />
                    </PaginationItem>
                    <PaginationItem>
                        <span className="px-4 text-sm">Page {totalPages > 0 ? page+1 : 0} / {totalPages}</span>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext href="#" onClick={(e) => {e.preventDefault(); handlePageChange(page+1)}} />
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
          <p className="text-muted-foreground">신규 등록된 사업장을 관리합니다.</p>
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

      {/* 상세 보기 모달 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-5xl w-full h-[85vh] p-0 overflow-hidden flex flex-col bg-background border-0 sm:rounded-xl">
          {isDetailLoading || !detailData ? (
            <div className="flex h-full items-center justify-center flex-col gap-4">
              <DialogTitle className="sr-only">상세 정보 로딩 중</DialogTitle>
              <DialogDescription className="sr-only">데이터를 불러오는 중입니다.</DialogDescription>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">데이터를 불러오는 중입니다...</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row h-full overflow-hidden">
              
              {/* 좌측 상세 정보 */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-background">
                <div className="mb-8 flex items-start justify-between">
                  <div className="flex gap-4 items-center min-w-0">
                    <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                      <StoreIcon className="h-8 w-8" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <DialogTitle className="text-2xl font-bold text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                        {detailData.storeName}
                      </DialogTitle>
                      <DialogDescription className="text-base font-medium text-muted-foreground mt-1 whitespace-nowrap">
                        {detailData.industry} · {detailData.posVendor || "POS 미연동"}
                      </DialogDescription>
                    </div>
                  </div>
                  <Badge className="text-sm px-3 py-1 shrink-0" variant={getStatusBadgeVariant(detailData.status)}>
                    {getStatusLabel(detailData.status)}
                  </Badge>
                </div>

                <div className="space-y-8 pr-2">
                  {/* 기본 정보 */}
                  <section>
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      기본 정보
                    </h3>
                    <div className="grid gap-4 bg-muted/30 p-5 rounded-xl border">
                      <div className="grid grid-cols-[24px_1fr] gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-xs font-medium text-muted-foreground mb-0.5">위치 정보 (GPS)</span>
                          <span className="text-sm text-foreground break-all">
                            {detailData.latitude && detailData.longitude 
                              ? `위도: ${detailData.latitude}, 경도: ${detailData.longitude}`
                              : <span className="text-muted-foreground italic">위치 정보 없음</span>
                            }
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-[24px_1fr] gap-2">
                        <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div>
                          <span className="block text-xs font-medium text-muted-foreground mb-0.5">대표 전화</span>
                          <span className="text-sm text-foreground">{detailData.phone || "-"}</span>
                        </div>
                      </div>
                    </div>
                  </section>
                  <Separator />
                  {/* 사업자 정보 */}
                  <section>
                    <h3 className="text-sm font-semibold text-foreground mb-4">사업자 정보</h3>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <span className="block text-xs text-muted-foreground mb-1">사업자등록번호</span>
                        <span className="font-medium font-mono">{detailData.bizNum}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-muted-foreground mb-1">사업장 코드</span>
                        <span className="font-medium font-mono">STORE-{detailData.storeId}</span>
                      </div>
                    </div>
                  </section>
                  <Separator />
                   {/* 등록 정보 */}
                   <section>
                    <h3 className="text-sm font-semibold text-foreground mb-4">등록 정보</h3>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="block text-xs text-muted-foreground mb-1">최근 승인일</span>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDateTime(detailData.approvedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* 우측 사이드바 */}
              <div className="w-full md:w-[360px] border-t md:border-t-0 md:border-l bg-muted/10 flex flex-col h-full shrink-0">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* 사장님 정보 */}
                  <div className="bg-background rounded-xl border shadow-sm p-5">
                    <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" /> 사장님 정보
                    </h4>
                    <div className="space-y-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">이름</span>
                        <span className="font-medium text-lg">{detailData.ownerName || "-"}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                         <span className="text-xs text-muted-foreground">이메일</span>
                         <span className="font-medium break-all">{detailData.ownerEmail || "-"}</span>
                      </div>
                    </div>
                  </div>

                  {/* 직원 현황 */}
                  <div className="bg-background rounded-xl border shadow-sm p-5 flex flex-col flex-1 min-h-[240px]">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" /> 직원 현황
                      </h4>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                        {detailData.employees?.length || 0}명
                      </Badge>
                    </div>

                    <ScrollArea className="flex-1 -mx-2 px-2">
                      <div className="space-y-2">
                        {(!detailData.employees || detailData.employees.length === 0) ? (
                          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                            <Users className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-xs">등록된 직원이 없습니다.</p>
                          </div>
                        ) : (
                          detailData.employees.map((emp, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-transparent hover:border-muted transition-colors">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">{emp.name}</span>
                                <span className="text-xs text-muted-foreground">{emp.role}</span>
                              </div>
                              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                                {emp.status}
                              </Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                {/* 하단 버튼 */}
                <div className="p-6 border-t bg-background/50 flex gap-3 mt-auto">
                  {detailData.status !== "REJECTED" && (
                    <Button 
                      variant="outline" 
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-11"
                      onClick={() => { handleReject(detailData.storeId); setIsDetailOpen(false); }}
                    >
                      반려
                    </Button>
                  )}

                  {detailData.status !== "APPROVED" && (
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-11"
                      onClick={() => { handleApprove(detailData.storeId); setIsDetailOpen(false); }}
                    >
                      승인
                    </Button>
                  )}

                  { (detailData.status === "APPROVED" || detailData.status === "REJECTED") && (
                     <Button className="w-full h-11" variant="outline" onClick={() => setIsDetailOpen(false)}>
                          닫기
                     </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}