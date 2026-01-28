"use client";

import { useState } from "react";
import { useInquiries } from "./useInquiries";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import InquiryCreateDialog from "./InquiryCreateDialog";
import InquiryDetailDialog from "./InquiryDetailDialog"; // ✅ 추가됨
import { CommonPagination } from "@/shared/ui/CommonPagination";
import { Inquiry } from "./inquiryTypes"; // 타입 import

export default function InquiryList() {
  const { 
    inquiries, isLoading, totalPages, page, setPage, deleteInquiry 
  } = useInquiries();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // ✅ 상세 팝업 상태 관리
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ✅ 행 클릭 시 상세 팝업 열기
  const handleRowClick = (item: Inquiry) => {
    setSelectedInquiry(item);
    setIsDetailOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // ✅ 클릭 이벤트가 행(Row)으로 전파되지 않도록 막음
    if (confirm("정말 이 문의를 삭제하시겠습니까?")) {
      await deleteInquiry(id);
    }
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleDateString("ko-KR");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">1:1 문의 내역</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> 문의하기
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>나의 문의 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">번호</TableHead>
                <TableHead className="w-[100px]">상태</TableHead>
                <TableHead className="w-[100px]">분류</TableHead>
                <TableHead>제목</TableHead>
                <TableHead className="w-[150px]">사업장</TableHead>
                <TableHead className="w-[120px]">작성일</TableHead>
                <TableHead className="w-[80px]">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    로딩 중...
                  </TableCell>
                </TableRow>
              ) : inquiries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    등록된 문의가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                inquiries.map((item) => (
                  <TableRow 
                    key={item.inquiryId} 
                    className="cursor-pointer hover:bg-muted/50" // ✅ 클릭 가능 표시
                    onClick={() => handleRowClick(item)} // ✅ 클릭 이벤트 연결
                  >
                    <TableCell>{item.inquiryId}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'RESPONDED' ? "default" : "secondary"}>
                        {item.status === 'RESPONDED' ? '답변완료' : '대기중'}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="font-medium">
                        {item.title}
                    </TableCell>
                    <TableCell>{item.storeName || "-"}</TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell>
                      {item.status === 'PENDING' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => handleDelete(e, item.inquiryId)} // ✅ e 전달
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="mt-4">
            <CommonPagination 
              page={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
            />
          </div>
        </CardContent>
      </Card>

      <InquiryCreateDialog 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
      />
      
      {/* ✅ 상세 보기 팝업 추가 */}
      <InquiryDetailDialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        inquiry={selectedInquiry}
      />
    </div>
  );
}