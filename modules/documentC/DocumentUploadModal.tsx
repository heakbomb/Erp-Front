// src/modules/document/DocumentUploadModal.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/shared/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/shared/ui/form";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type { DocumentFormValues } from "./documentTypes";
import { Loader2 } from "lucide-react";

// 파일 검증 스키마
const documentSchema = z.object({
  docType: z.string().min(1, "문서 유형을 입력해주세요."),
  retentionEndDate: z.string().min(1, "보관 만료일을 선택해주세요."),
  file: z
    .any()
    .refine((files) => files instanceof FileList && files.length > 0, "업로드할 파일을 선택해주세요."),
});

interface DocumentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DocumentFormValues) => void;
  isPending: boolean;
}

export default function DocumentUploadModal({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: DocumentUploadModalProps) {
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      docType: "",
      retentionEndDate: "",
      file: undefined,
    },
  });

  // 모달 열릴 때 폼 초기화
  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  const fileRef = form.register("file");

  return (
    <Dialog open={open} onOpenChange={(v) => !isPending && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>문서 업로드</DialogTitle>
          <DialogDescription>
            업로드된 문서는 설정된 만료일까지 안전하게 보관됩니다.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="docType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>문서 유형</FormLabel>
                  <FormControl>
                    <Input placeholder="예) 근로계약서, 보건증" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="retentionEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>보관 만료일</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem>
                  <FormLabel>파일 첨부</FormLabel>
                  <FormControl>
                    <Input type="file" {...fileRef} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isPending}>
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "업로드 중..." : "업로드 하기"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}