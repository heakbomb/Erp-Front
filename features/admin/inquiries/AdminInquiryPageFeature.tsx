// features/admin/inquiries/AdminInquiryPageFeature.tsx
"use client";

import { useState, useEffect } from "react";
import { useAdminInquiries } from "./hooks/useAdminInquiries";
import { AdminReplyDialog } from "./components/AdminReplyDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InquiryResponse } from "@/lib/types/inquiry";

// 페이지네이션 상수
const PAGE_WINDOW = 5;

export default function AdminInquiryPageFeature() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const adminId = 1; 
  
  // [추가] 페이지 상태
  const [page, setPage] = useState(0);

  // [수정] 훅에 page 전달
  const { 
    inquiries, isLoading, totalPages, totalElements, 
    filterStatus, setFilterStatus, 
    filterCategory, setFilterCategory,
    replyInquiry 
  } = useAdminInquiries(page); // size는 훅 기본값(6) 사용
  
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryResponse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // [추가] 필터 변경 시 페이지 초기화 핸들러
  const handleFilterStatusChange = (val: any) => {
    setFilterStatus(val);
    setPage(0);
  };

  const handleFilterCategoryChange = (val: any) => {
    setFilterCategory(val);
    setPage(0);
  };

  const handleReplyClick = (inquiry: InquiryResponse) => {
    setSelectedInquiry(inquiry);
    setIsDialogOpen(true);
  };

  const handleReplySubmit = async (inquiryId: number, answer: string) => {
    await replyInquiry({ adminId, inquiryId, answer });
  };

  // [추가] 페이지 이동 핸들러
  const handlePageChange = (p: number) => {
    if (p >= 0 && p < totalPages) {
      setPage(p);
    }
  };

  // [추가] 페이지네이션 계산
  const start = Math.floor(page / PAGE_WINDOW) * PAGE_WINDOW;
  const end = Math.min(start + PAGE_WINDOW - 1, Math.max(totalPages - 1, 0));

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">문의 관리</h2>

        <div className="flex gap-2">
          {/* 1. 카테고리 필터 */}
          <Select 
            value={filterCategory} 
            onValueChange={handleFilterCategoryChange} 
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 분류</SelectItem>
              <SelectItem value="INQUIRY">일반 문의</SelectItem>
              <SelectItem value="SUGGESTION">건의 사항</SelectItem>
              <SelectItem value="REPORT">신고 하기</SelectItem>
            </SelectContent>
          </Select>

          {/* 2. 상태 필터 */}
          <Select 
            value={filterStatus} 
            onValueChange={handleFilterStatusChange} 
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="처리 상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 상태</SelectItem>
              <SelectItem value="PENDING">대기중</SelectItem>
              <SelectItem value="RESPONDED">답변 완료</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>문의 목록</CardTitle>
          {/* 총 건수 표시 */}
          <p className="text-sm text-muted-foreground">총 {totalElements}건의 문의가 있습니다.</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead className="w-[40%]">제목</TableHead>
                <TableHead>작성자</TableHead>
                <TableHead>작성일</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10">로딩 중...</TableCell></TableRow>
              ) : inquiries.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10">문의 내역이 없습니다.</TableCell></TableRow>
              ) : (
                inquiries.map((item) => (
                  <TableRow key={item.inquiryId}>
                    <TableCell>{item.inquiryId}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'RESPONDED' ? "default" : "secondary"}>
                        {item.status === 'RESPONDED' ? '완료' : '대기'}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="font-medium truncate max-w-[300px]" title={item.title}>
                        {item.title}
                    </TableCell>
                    <TableCell>{item.ownerName} {item.storeName && `(${item.storeName})`}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      {item.status === 'PENDING' ? (
                        <Button size="sm" onClick={() => handleReplyClick(item)}>답변하기</Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleReplyClick(item)}
                        >
                          답변확인
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* [추가] 페이지네이션 UI */}
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

        </CardContent>
      </Card>

      <AdminReplyDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        inquiry={selectedInquiry}
        onReply={handleReplySubmit}
      />
    </div>
  );
}