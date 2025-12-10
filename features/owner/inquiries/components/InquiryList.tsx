// features/owner/inquiries/components/InquiryList.tsx
import { InquiryResponse } from "@/lib/types/inquiry";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Props {
  inquiries: InquiryResponse[];
  onDelete: (id: number) => void;
}

export function InquiryList({ inquiries, onDelete }: Props) {
  
  if (inquiries.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 bg-white rounded-lg border">
        문의 내역이 없습니다.
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-2">
      {inquiries.map((item) => (
        <AccordionItem key={item.inquiryId} value={`item-${item.inquiryId}`} className="border rounded-lg px-4 bg-white">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex flex-1 items-center justify-between mr-4">
              <div className="flex items-center gap-3">
                {/* 상태 뱃지 */}
                <Badge variant={item.status === 'RESPONDED' ? "default" : "secondary"}>
                  {item.status === 'RESPONDED' ? '답변완료' : '대기중'}
                </Badge>
                
                {/* 카테고리 및 제목 */}
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs text-gray-500 font-normal mb-0.5">
                    [{item.category}] {item.storeName ? `- ${item.storeName}` : ''}
                  </span>
                  <span className="font-medium text-sm md:text-base">{item.title}</span>
                </div>
              </div>
              
              {/* [수정] 작성일시 포맷 변경: 날짜 + 시간(시:분) 표시 */}
              <div className="text-xs text-gray-400 font-normal shrink-0">
                {new Date(item.createdAt).toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                })}
              </div>
            </div>
          </AccordionTrigger>
          
          <AccordionContent className="pt-2 pb-6 border-t mt-2">
            <div className="space-y-6">
              {/* 질문 내용 */}
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="font-semibold text-sm mb-2 text-gray-700">문의 내용</p>
                <p className="text-sm whitespace-pre-wrap text-gray-600">{item.content}</p>
              </div>

              {/* 답변 내용 (있을 경우만) */}
              {item.answer && (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-sm text-blue-800">관리자 답변</p>
                    <span className="text-xs text-blue-600">
                      {/* [수정] 답변 일시 포맷 통일 */}
                      {item.answeredAt && new Date(item.answeredAt).toLocaleString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-gray-700">{item.answer}</p>
                </div>
              )}

              {/* 삭제 버튼 (대기중일 때만) */}
              {item.status === 'PENDING' && (
                <div className="flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                        if(confirm('정말 삭제하시겠습니까?')) onDelete(item.inquiryId);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> 삭제
                  </Button>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}