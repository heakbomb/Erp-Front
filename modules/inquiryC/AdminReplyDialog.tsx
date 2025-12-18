// modules/inquiryC/AdminReplyDialog.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Inquiry } from "./inquiryTypes";
import { Separator } from "@/shared/ui/separator";

const formSchema = z.object({
  answer: z.string().min(1, "답변 내용을 입력해주세요."),
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry | null;
  onReply: (inquiryId: number, answer: string) => Promise<void>;
}

export default function AdminReplyDialog({ isOpen, onClose, inquiry, onReply }: Props) {
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

  // 날짜 포맷팅 헬퍼 (배열/문자열 처리)
  const formatDate = (dateValue: any) => {
    if (!dateValue) return "-";
    if (Array.isArray(dateValue)) {
      const [year, month, day, hour = 0, minute = 0] = dateValue;
      return `${year}.${String(month).padStart(2,'0')}.${String(day).padStart(2,'0')} ${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;
    }
    return new Date(dateValue).toLocaleString("ko-KR", {
       year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
    });
  };

  const isResponded = inquiry?.status === 'RESPONDED';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isResponded ? "답변 내역" : "답변 등록"}</DialogTitle>
        </DialogHeader>
        
        {inquiry && (
          <>
            <div className="bg-muted/30 p-5 rounded-lg border">
              <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {inquiry.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                          {formatDate(inquiry.createdAt)} · {inquiry.ownerName}
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

            {isResponded && inquiry.answer && (
              <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-100 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-blue-800">관리자 답변</span>
                  <span className="text-xs text-blue-600">
                    {formatDate(inquiry.answeredAt)}
                  </span>
                </div>
                <div className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">
                  {inquiry.answer}
                </div>
              </div>
            )}
          </>
        )}

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