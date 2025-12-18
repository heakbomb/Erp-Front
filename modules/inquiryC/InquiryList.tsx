// modules/inquiryC/InquiryList.tsx
"use client";

import { useState } from "react";
// import { useAuth } from "@/contexts/AuthContext"; // [주석] 인증 훅 임시 비활성화
import { useInquiries } from "./useInquiries";
import InquiryCreateDialog from "./InquiryCreateDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { Button } from "@/shared/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/ui/accordion";
import { Badge } from "@/shared/ui/badge";
import { Trash2 } from "lucide-react";

const PAGE_WINDOW = 5;

// 날짜 포맷팅 헬퍼
function formatDate(dateValue: any) {
  if (!dateValue) return "-";
  if (Array.isArray(dateValue)) {
    const [year, month, day, hour = 0, minute = 0] = dateValue;
    return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }
  return new Date(dateValue).toLocaleString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
  }).replace(/\. /g, ".").replace(":", ":");
}

export default function InquiryList() {
  // const { user } = useAuth(); // [주석] 기존 인증 로직
  // const ownerId = user && user.role === 'OWNER' ? user.owner_id : undefined;

  // ✅ [수정] 테스트를 위해 ownerId를 1로 강제 고정
  const ownerId = 1;
  const user = { role: 'OWNER', owner_id: 1 }; // 더미 유저 객체 (필요 시 사용)

  const [page, setPage] = useState(0);

  const { inquiries, totalPages, totalElements, isLoading, createInquiry, isCreating, deleteInquiry } = useInquiries(ownerId, page);

  // ✅ [수정] 로그인 체크 로직 주석 처리 (무조건 통과)
  /*
  if (!user || user.role !== 'OWNER' || !ownerId) {
    return <div className="p-8 text-center">로그인이 필요한 서비스입니다.</div>;
  }
  */

  const handlePageChange = (p: number) => { if (p >= 0 && p < totalPages) setPage(p); };
  const start = Math.floor(page / PAGE_WINDOW) * PAGE_WINDOW;
  const end = Math.min(start + PAGE_WINDOW - 1, Math.max(totalPages - 1, 0));

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">1:1 문의</h2>
            <p className="text-muted-foreground mt-1">시스템 이용 중 궁금한 점이나 불편사항을 문의해주세요.</p>
        </div>
        <InquiryCreateDialog 
            ownerId={ownerId} 
            onCreate={async (data) => { await createInquiry(data); setPage(0); }} 
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
             <div className="space-y-3"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-white rounded-lg border">문의 내역이 없습니다.</div>
          ) : (
            <>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {inquiries.map((item) => (
                  <AccordionItem key={item.inquiryId} value={`item-${item.inquiryId}`} className="border rounded-lg px-4 bg-white">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex flex-1 items-center justify-between mr-4">
                        <div className="flex items-center gap-3">
                          <Badge variant={item.status === 'RESPONDED' ? "default" : "secondary"}>
                            {item.status === 'RESPONDED' ? '답변완료' : '대기중'}
                          </Badge>
                          <div className="flex flex-col items-start text-left">
                            <span className="text-xs text-gray-500 font-normal mb-0.5">[{item.category}] {item.storeName ? `- ${item.storeName}` : ''}</span>
                            <span className="font-medium text-sm md:text-base">{item.title}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 font-normal shrink-0">{formatDate(item.createdAt)}</div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 border-t mt-2">
                      <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="font-semibold text-sm mb-2 text-gray-700">문의 내용</p>
                          <p className="text-sm whitespace-pre-wrap text-gray-600">{item.content}</p>
                        </div>
                        {item.answer && (
                          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-semibold text-sm text-blue-800">관리자 답변</p>
                              <span className="text-xs text-blue-600">{formatDate(item.answeredAt)}</span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap text-gray-700">{item.answer}</p>
                          </div>
                        )}
                        {/* 삭제 버튼: 로그인 체크 없이 상태만 보고 표시 */}
                        {item.status === 'PENDING' && (
                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => { if(confirm('정말 삭제하시겠습니까?')) deleteInquiry(item.inquiryId); }}>
                              <Trash2 className="w-4 h-4 mr-1" /> 삭제
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {/* 페이지네이션 UI */}
              {totalPages > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">페이지 {page + 1} / {Math.max(totalPages, 1)}</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => handlePageChange(0)}>« 처음</Button>
                    <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => handlePageChange(page - 1)}>‹ 이전</Button>
                    {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) => (
                        <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => handlePageChange(p)}>{p + 1}</Button>
                    ))}
                    <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => handlePageChange(page + 1)}>다음 ›</Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => handlePageChange(totalPages - 1)}>마지막 »</Button>
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