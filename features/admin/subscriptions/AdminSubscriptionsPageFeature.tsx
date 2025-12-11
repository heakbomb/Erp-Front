"use client"

import React, { useState } from "react";
// ⭐️ shadcn/ui 컴포넌트
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// ❌ 기존 Pagination import 제거
import { Search, Loader2, MoreVertical, Plus, Trash2, Edit } from "lucide-react"; 
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// ⭐️ 훅 및 타입 임포트
import { useAdminSubscriptions } from "./hooks/useAdminSubscriptions";
import type { Subscription, SubscriptionRequest, SubscriptionStatus } from "./adminSubscriptionsService";

// ✅ [추가] 한 번에 보여줄 페이지 번호 개수 (예: 1 2 3 4 5)
const PAGE_WINDOW = 5;

export default function AdminSubscriptionsPageFeature() {
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => { setMounted(true) }, []);

  // 1. 훅 호출
  const {
    tab,
    handleTabChange,
    searchQuery,
    setSearchQuery,
    handleSearch,
    page,
    handlePageChange,
    isMutating,
    productsQuery,
    handleCreate,
    handleUpdate,
    handleDelete,
    statusQuery,
  } = useAdminSubscriptions();

  // 2. 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  // 3. Hydration Mismatch 방지용 스켈레톤
  if (!mounted) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div>
          <div className="h-10 bg-gray-200 rounded w-64 dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-200 rounded w-80 mt-2 dark:bg-gray-700"></div>
        </div>
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div className="h-8 bg-gray-200 rounded w-32 dark:bg-gray-700"></div>
              <div className="h-10 bg-gray-200 rounded w-32 dark:bg-gray-700"></div>
            </div>
            <div className="mt-4"><div className="h-10 bg-gray-200 rounded w-full dark:bg-gray-700"></div></div>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 border-b">
              <div className="h-10 bg-gray-200 rounded-t-md w-24 dark:bg-gray-700"></div>
              <div className="h-10 bg-gray-200 rounded-t-md w-24 dark:bg-gray-700"></div>
            </div>
            <div className="flex justify-center p-4 mt-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4. 모달 핸들러
  const openNewModal = () => {
    setEditingSubscription(null);
    setIsModalOpen(true);
  };
  const openEditModal = (sub: Subscription) => {
    setEditingSubscription(sub);
    setIsModalOpen(true);
  };

  // 5. 활성 탭 데이터 선택
  const activeQuery = tab === "PRODUCTS" ? productsQuery : statusQuery;
  const totalPages = activeQuery.data?.totalPages ?? 0;
  const isLoading = activeQuery.isLoading;

  // ✅ [추가] 페이지네이션 구간 계산 (다른 페이지와 동일한 로직)
  const start = Math.floor(page / PAGE_WINDOW) * PAGE_WINDOW;
  const end = Math.min(start + PAGE_WINDOW - 1, Math.max(totalPages - 1, 0));

  // 6. 실제 UI
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">구독 관리</h1>
        <p className="text-muted-foreground">구독 상품 및 사용자 구독 현황을 관리합니다.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {tab === "PRODUCTS" ? "구독 상품 목록" : "사용자 구독 현황"}
            </CardTitle>
            {tab === "PRODUCTS" && (
              <Button onClick={openNewModal}>
                <Plus className="mr-2 h-4 w-4" />
                신규 상품 추가
              </Button>
            )}
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={
                  tab === "PRODUCTS" 
                    ? "상품명으로 검색..." 
                    : "사장님 이름, 이메일, 플랜명으로 검색..."
                }
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="PRODUCTS">상품 관리</TabsTrigger>
              <TabsTrigger value="STATUS">구독 현황</TabsTrigger>
            </TabsList>

            <div className="mt-4">
              {isLoading && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
              {activeQuery.error && <div className="text-red-500 text-center p-4">{(activeQuery.error as Error).message}</div>}
              
              {!isLoading && !activeQuery.error && (
                <>
                  <TabsContent value="PRODUCTS">
                    <ProductsTable
                      data={productsQuery.data?.content ?? []}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                      isMutating={isMutating}
                    />
                  </TabsContent>

                  <TabsContent value="STATUS">
                    <StatusTable data={statusQuery.data?.content ?? []} />
                  </TabsContent>
                  
                  {/* ✅ [수정] 다른 페이지와 동일한 스타일의 페이지네이션 적용 */}
                  {totalPages > 0 && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        페이지 {page + 1} / {Math.max(totalPages, 1)}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* 처음으로 */}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={page === 0} 
                          onClick={() => handlePageChange(0)}
                        >
                          « 처음
                        </Button>
                        {/* 이전 */}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={page <= 0} 
                          onClick={() => handlePageChange(page - 1)}
                        >
                          ‹ 이전
                        </Button>

                        {/* 페이지 번호 (1 2 3 ...) */}
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

                        {/* 다음 */}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={page >= totalPages - 1} 
                          onClick={() => handlePageChange(page + 1)}
                        >
                          다음 ›
                        </Button>
                        {/* 마지막으로 */}
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
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <SubscriptionModal
        key={editingSubscription?.subId ?? 'new'}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        subscription={editingSubscription}
        onSubmit={editingSubscription ? handleUpdate : handleCreate}
        isMutating={isMutating}
      />
    </div>
  )
}

// --- 1. 상품 관리 테이블 ---
function ProductsTable({ data, onEdit, onDelete, isMutating }: {
  data: Subscription[],
  onEdit: (sub: Subscription) => void,
  onDelete: (id: number) => void,
  isMutating: boolean
}) {
  return (
    <Table><TableHeader><TableRow>
      <TableHead>Sub ID</TableHead>
      <TableHead>상품명</TableHead>
      <TableHead>월 가격</TableHead>
      <TableHead>상태</TableHead>
      <TableHead className="text-right">작업</TableHead>
    </TableRow></TableHeader><TableBody>
      {data.length === 0 && (
        <TableRow key="empty-row-sub">
          <TableCell colSpan={5} className="text-center text-muted-foreground">
            데이터가 없습니다.
          </TableCell>
        </TableRow>
      )}
      {data.map((sub) => (
        <TableRow key={sub.subId}>
          <TableCell>{sub.subId}</TableCell>
          <TableCell className="font-medium">{sub.subName}</TableCell>
          <TableCell>{sub.monthlyPrice.toLocaleString()}원</TableCell>
          <TableCell>
            <Badge variant={sub.isActive ? "default" : "secondary"}>
              {sub.isActive ? "ACTIVE" : "INACTIVE"}
            </Badge>
          </TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isMutating}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(sub)}>
                  <Edit className="mr-2 h-4 w-4" /> 수정
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(sub.subId)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> 삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody></Table>
  );
}

// --- 2. 구독 현황 테이블 ---
function StatusTable({ data }: { data: SubscriptionStatus[] }) {
  return (
    <Table><TableHeader><TableRow>
      <TableHead>사장님 이름</TableHead>
      <TableHead>이메일</TableHead>
      <TableHead>구독 플랜</TableHead>
      <TableHead>상태</TableHead>
      <TableHead>만료일</TableHead>
    </TableRow></TableHeader><TableBody>
      {data.length === 0 && (
        <TableRow key="empty-row-sub-status">
          <TableCell colSpan={5} className="text-center text-muted-foreground">
            데이터가 없습니다.
          </TableCell>
        </TableRow>
      )}
      {data.map((sub) => {
        const isExpired = new Date(sub.expiryDate) < new Date();
        return (
          <TableRow key={sub.ownerSubId}>
            <TableCell className="font-medium">{sub.ownerName}</TableCell>
            <TableCell>{sub.ownerEmail}</TableCell>
            <TableCell>{sub.subName}</TableCell>
            <TableCell>
              <Badge variant={isExpired ? "secondary" : "default"}>
                {isExpired ? "만료됨" : "활성"}
              </Badge>
            </TableCell>
            <TableCell>{sub.expiryDate}</TableCell>
          </TableRow>
        );
      })}
    </TableBody></Table>
  );
}


// --- 3. 생성/수정 모달 컴포넌트 ---
function SubscriptionModal({
  isOpen,
  onOpenChange,
  subscription,
  onSubmit,
  isMutating
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: Subscription | null;
  onSubmit: (idOrData: any, data?: any) => void;
  isMutating: boolean;
}) {
  const [name, setName] = useState(subscription?.subName ?? "");
  const [price, setPrice] = useState(subscription?.monthlyPrice ?? 0);
  const [isActive, setIsActive] = useState(subscription?.isActive ?? true);

  // 모달 열릴 때 초기화
  React.useEffect(() => {
    if (isOpen) {
      setName(subscription?.subName ?? "");
      setPrice(subscription?.monthlyPrice ?? 0);
      setIsActive(subscription?.isActive ?? true);
    }
  }, [isOpen, subscription]);

  const handleSubmit = () => {
    const data: SubscriptionRequest = {
      subName: name,
      monthlyPrice: Number(price),
      isActive: isActive,
    };
    
    if (subscription) {
      onSubmit(subscription.subId, data); 
    } else {
      onSubmit(data); 
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {subscription ? "구독 상품 수정" : "신규 구독 상품 생성"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            상품의 이름, 가격, 활성 상태를 설정합니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subName">상품명</Label>
            <Input
              id="subName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 프리미엄 플랜"
              maxLength={20} 
            />
            <div className="text-xs text-right text-muted-foreground mt-1">
              {name.length} / 20
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">월 가격 (원)</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => {
                const val = e.target.value;
                if (val.length > 8) return; 
                setPrice(Number(val));
              }}
              placeholder="예: 29900"
            />
            <div className="text-xs text-right text-muted-foreground mt-1">
              최대 8자리
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">
              {isActive ? "활성 (사용자들이 구독 가능)" : "비활성 (구독 불가능)"}
            </Label>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isMutating}>취소</AlertDialogCancel>
          <Button onClick={handleSubmit} disabled={isMutating}>
            {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {subscription ? "저장" : "생성"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}