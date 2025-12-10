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

export default function AdminInquiryPageFeature() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const adminId = 1; // TODO: 실제 로그인된 관리자 ID로 교체 필요
  const { 
    inquiries, isLoading, 
    filterStatus, setFilterStatus, 
    filterCategory, setFilterCategory,
    replyInquiry 
  } = useAdminInquiries();
  
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryResponse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!mounted) return null;

  const handleReplyClick = (inquiry: InquiryResponse) => {
    setSelectedInquiry(inquiry);
    setIsDialogOpen(true);
  };

  const handleReplySubmit = async (inquiryId: number, answer: string) => {
    await replyInquiry({ adminId, inquiryId, answer });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">문의 관리</h2>

        <div className="flex gap-2">
          {/* 1. 카테고리 필터 */}
          <Select 
            value={filterCategory} 
            onValueChange={(val: any) => setFilterCategory(val)}
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
            onValueChange={(val: any) => setFilterStatus(val)}
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
        <CardHeader><CardTitle>문의 목록</CardTitle></CardHeader>
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
                    {/* [수정] 작성일시 포맷 변경: 날짜 + 시간(시:분) 표시 */}
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