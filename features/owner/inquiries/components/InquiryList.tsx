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

// ✅ 날짜 포맷팅 헬퍼 함수 추가
function formatDate(dateValue: string | number[] | null | undefined) {
  if (!dateValue) return "-";

  // 1. 배열 형태인 경우 ([2024, 12, 11, 15, 30])
  if (Array.isArray(dateValue)) {
    const [year, month, day, hour = 0, minute = 0] = dateValue;
    // 월(month)은 0부터 시작하지 않고 1부터 시작하는 배열이므로 그대로 사용 (Date 객체 생성 시에는 -1 필요하지만 문자열 조합이 더 안전함)
    return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  // 2. 문자열 형태인 경우 (ISO String)
  try {
    const date = new Date(dateValue);
    // 날짜가 유효하지 않으면 원본 반환
    if (isNaN(date.getTime())) return String(dateValue);

    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24시간제
    }).replace(/\. /g, ".").replace(":", ":"); // 포맷 다듬기 (선택 사항)
  } catch (e) {
    return String(dateValue);
  }
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
              
              {/* ✅ 작성일시 (헬퍼 함수 사용) */}
              <div className="text-xs text-gray-400 font-normal shrink-0">
                {formatDate(item.createdAt)}
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
                      {/* ✅ 답변 일시 (헬퍼 함수 사용) */}
                      {formatDate(item.answeredAt)}
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