"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import { useAdminStores } from "./useAdminStores";
import type { Store } from "@/shared/types/database";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { 
  Search, Loader2, MoreVertical, Eye, Check, X,
  MapPin, Phone, Store as StoreIcon, User, Users, Calendar
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { Separator } from "@/shared/ui/separator";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { CommonPagination } from "@/shared/ui/CommonPagination"; // ✅ 추가

// ✅ [수정] interface extends 대신 type & Omit 사용으로 충돌 방지
type AdminStore = Omit<Store, "approvedAt"> & {
  approvedAt?: string | null;
  bizNum?: string | null;
};

// ✅ [수정] 상세 정보 타입도 동일하게 적용
type StoreDetail = Omit<Store, "approvedAt"> & {
  bizNum?: string | null;
  phone?: string | null;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  approvedAt?: string | null;
  employees?: {
    name: string;
    role: string;
    status: string;
  }[];
};

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

export default function AdminStoreList() {
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const {
    storesData,
    isStoresLoading,
    tab,
    handleTabChange,
    searchQuery,
    setSearchQuery,
    handleSearch,
    page,
    handlePageChange,
    handleApprove,
    handleReject,
  } = useAdminStores();

  // ✅ [확인] 데이터를 AdminStore[] 타입으로 단언
  const stores = (storesData?.content || []) as AdminStore[];
  const totalElements = storesData?.totalElements || 0;
  const totalPages = storesData?.totalPages || 0;

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

  const StoresTableContent = (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>매장명</TableHead>
            <TableHead>업종</TableHead>
            <TableHead>사업자번호</TableHead>
            <TableHead>상태</TableHead>
            <TableHead className="text-right">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isStoresLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : stores.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                데이터가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            stores.map((store) => (
              <TableRow key={store.storeId}>
                <TableCell>{store.storeId}</TableCell>
                <TableCell className="font-medium">{store.storeName}</TableCell>
                <TableCell>{store.industry}</TableCell>
                <TableCell className="font-mono text-xs">{store.bizNum}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 items-start">
                    <Badge variant={getStatusBadgeVariant(store.status)}>
                      {getStatusLabel(store.status)}
                    </Badge>
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>사업장 목록 ({totalElements}개)</CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="매장명, 사업자번호 검색"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} variant="secondary">검색</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="PENDING">승인 대기</TabsTrigger>
              <TabsTrigger value="APPROVED">운영중</TabsTrigger>
              <TabsTrigger value="REJECTED">반려됨</TabsTrigger>
              <TabsTrigger value="ALL">전체</TabsTrigger>
            </TabsList>

            <TabsContent value="PENDING">{StoresTableContent}</TabsContent>
            <TabsContent value="APPROVED">{StoresTableContent}</TabsContent>
            <TabsContent value="REJECTED">{StoresTableContent}</TabsContent>
            <TabsContent value="ALL">{StoresTableContent}</TabsContent>

            {/* ✅ 공통 페이징 컴포넌트 적용 */}
            <CommonPagination 
              page={page} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </Tabs>
        </CardContent>
      </Card>

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
                  <section>
                    <h3 className="text-sm font-semibold text-foreground mb-4">사업자 정보</h3>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <span className="block text-xs text-muted-foreground mb-1">사업자등록번호</span>
                        <span className="font-medium font-mono">{detailData.bizNum}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-muted-foreground mb-1">사업장 코드</span>
                        <span className="font-medium font-mono">{detailData.storeId}</span>
                      </div>
                    </div>
                  </section>
                  <Separator />
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

              <div className="w-full md:w-[360px] border-t md:border-t-0 md:border-l bg-muted/10 flex flex-col h-full shrink-0">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
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