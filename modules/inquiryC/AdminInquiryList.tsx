// modules/inquiryC/AdminInquiryList.tsx
"use client";

import { useState, useEffect } from "react";
import { useAdminInquiries } from "./useAdminInquiries";
import AdminReplyDialog from "./AdminReplyDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Inquiry } from "./inquiryTypes";

const PAGE_WINDOW = 5;

export default function AdminInquiryList() {
  const [page, setPage] = useState(0);
  const adminId = 1; // 실제 환경에선 auth context 등에서 가져와야 함

  const { 
    inquiries, isLoading, totalPages, totalElements, 
    filterStatus, setFilterStatus, 
    filterCategory, setFilterCategory,
    replyInquiry 
  } = useAdminInquiries(page);
  
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 필터 변경 시 페이지 초기화
  const handleFilterStatusChange = (val: any) => { setFilterStatus(val); setPage(0); };
  const handleFilterCategoryChange = (val: any) => { setFilterCategory(val); setPage(0); };

  const handleReplyClick = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsDialogOpen(true);
  };

  const handleReplySubmit = async (inquiryId: number, answer: string) => {
    await replyInquiry({ adminId, inquiryId, answer });
  };

  const handlePageChange = (p: number) => {
    if (p >= 0 && p < totalPages) setPage(p);
  };

  const start = Math.floor(page / PAGE_WINDOW) * PAGE_WINDOW;
  const end = Math.min(start + PAGE_WINDOW - 1, Math.max(totalPages - 1, 0));

  // 날짜 포맷팅 (헬퍼 함수 혹은 features 코드 재사용)
  const formatDate = (dateValue: any) => {
      if(!dateValue) return "-";
      return new Date(dateValue).toLocaleString("ko-KR", {
          year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">문의 관리</h2>

        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={handleFilterCategoryChange}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="카테고리" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 분류</SelectItem>
              <SelectItem value="INQUIRY">일반 문의</SelectItem>
              <SelectItem value="SUGGESTION">건의 사항</SelectItem>
              <SelectItem value="REPORT">신고 하기</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={handleFilterStatusChange}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="처리 상태" /></SelectTrigger>
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
                    <TableCell className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                    <TableCell>
                      <Button 
                          variant={item.status === 'PENDING' ? "default" : "ghost"} 
                          size="sm" 
                          className={item.status !== 'PENDING' ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50" : ""}
                          onClick={() => handleReplyClick(item)}
                      >
                          {item.status === 'PENDING' ? "답변하기" : "답변확인"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* 페이지네이션 */}
          {totalPages > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                페이지 {page + 1} / {Math.max(totalPages, 1)}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => handlePageChange(0)}>« 처음</Button>
                <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => handlePageChange(page - 1)}>‹ 이전</Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) => (
                    <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => handlePageChange(p)}>{p + 1}</Button>
                  ))}
                </div>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => handlePageChange(page + 1)}>다음 ›</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => handlePageChange(totalPages - 1)}>마지막 »</Button>
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