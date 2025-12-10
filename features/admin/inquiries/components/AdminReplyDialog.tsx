import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InquiryResponse } from "@/lib/types/inquiry";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  answer: z.string().min(1, "답변 내용을 입력해주세요."),
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  inquiry: InquiryResponse | null;
  onReply: (inquiryId: number, answer: string) => Promise<void>;
}

export function AdminReplyDialog({ isOpen, onClose, inquiry, onReply }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { answer: "" },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!inquiry) return;
    await onReply(inquiry.inquiryId, values.answer);
    form.reset();
    onClose();
  };

  const isResponded = inquiry?.status === 'RESPONDED';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isResponded ? "답변 내역" : "답변 등록"}</DialogTitle>
        </DialogHeader>
        
        {/* 원본 문의 내용 표시 */}
        {inquiry && (
          <>
            <div className="bg-muted/30 p-5 rounded-lg border">
              <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {inquiry.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                          {/* [수정] 작성일시 포맷 변경 (날짜 + 시간 표시) */}
                          {new Date(inquiry.createdAt).toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })} · {inquiry.ownerName}
                      </span>
                  </div>
                  <h4 className="font-bold text-base leading-snug break-words">
                      {inquiry.title}
                  </h4>
              </div>
              
              <Separator className="my-4 bg-border" />
              
              <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto pr-1">
                  {inquiry.content}
              </div>
            </div>

            {/* 답변 완료된 경우: 답변 내용 표시 */}
            {isResponded && inquiry.answer && (
              <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-100 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-blue-800">관리자 답변</span>
                  <span className="text-xs text-blue-600">
                    {/* 답변 일시도 동일한 포맷으로 표시 */}
                    {inquiry.answeredAt && new Date(inquiry.answeredAt).toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">
                  {inquiry.answer}
                </div>
              </div>
            )}
          </>
        )}

        {/* 답변 대기 상태일 때만 입력 폼 노출 */}
        {!isResponded ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-2">
              <FormField
                control={form.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">답변 내용</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="문의에 대한 답변을 작성해주세요." 
                        className="min-h-[120px] resize-y" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>취소</Button>
                <Button type="submit">등록하기</Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <DialogFooter className="mt-4">
            <Button type="button" onClick={onClose} className="w-full sm:w-auto">확인</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}