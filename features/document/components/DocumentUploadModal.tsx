// features/document/components/DocumentUploadModal.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../../../components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "../../../components/ui/form";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import type { DocumentFormValues } from "../hooks/useDocuments";

// ⭐️ Zod 스키마 (파일 입력 포함)
const documentSchema = z.object({
  docType: z.string().min(1, "문서 유형은 필수입니다. (예: 근로계약서)"),
  retentionEndDate: z.string().min(1, "보관 만료일은 필수입니다."), // ⭐️ 편의상 string, 캘린더 사용 시 z.date()
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "파일을 선택해야 합니다."),
});

interface DocumentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DocumentFormValues) => void;
  isPending: boolean;
}

export function DocumentUploadModal({
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
      file: undefined, // ⭐️ file input은 reset이 까다롭습니다.
    },
  });

  // ⭐️ 모달이 열릴 때 폼 초기화
  useEffect(() => {
    if (open) {
      form.reset({ docType: "", retentionEndDate: "", file: undefined });
    }
  }, [open, form]);

  // ⭐️ 파일 입력 필드를 위한 register 헬퍼
  const fileRef = form.register("file");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>인사 문서 업로드</DialogTitle>
          <DialogDescription>
            근로계약서, 통장 사본 등 S3에 안전하게 보관합니다. 
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* FormField: docType */}
            <FormField
              control={form.control}
              name="docType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>문서 유형</FormLabel>
                  <FormControl>
                    <Input placeholder="예) 2025년 홍길동 근로계약서" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* FormField: retentionEndDate */}
            <FormField
              control={form.control}
              name="retentionEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>보관 만료일</FormLabel>
                  <FormControl>
                    {/* ⭐️ shadcn 캘린더(popover)로 대체하는 것이 좋습니다. */}
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* FormField: file */}
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>파일 선택</FormLabel>
                  <FormControl>
                    {/* shadcn Input을 사용하지만, file input은 register로 관리합니다.
                      onChange를 field.onChange로 연결합니다.
                    */}
                    <Input 
                      type="file" 
                      {...fileRef} // ⭐️ register 연결
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isPending}>
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "업로드 중..." : "업로드"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}