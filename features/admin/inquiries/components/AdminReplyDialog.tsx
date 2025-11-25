import { useState } from "react";
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>답변 등록</DialogTitle>
        </DialogHeader>
        
        {/* 원본 문의 내용 표시 */}
        <div className="bg-gray-50 p-4 rounded-md mb-4 text-sm text-gray-700">
          <p className="font-semibold mb-1">[{inquiry?.category}] {inquiry?.title}</p>
          <p className="whitespace-pre-wrap text-gray-600">{inquiry?.content}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>답변 내용</FormLabel>
                  <FormControl>
                    <Textarea placeholder="답변을 작성해주세요..." className="min-h-[150px]" {...field} />
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
      </DialogContent>
    </Dialog>
  );
}