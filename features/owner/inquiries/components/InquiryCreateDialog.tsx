// features/owner/inquiries/components/InquiryCreateDialog.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea"; 
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/shared/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/shared/ui/select";
import { useStores } from "@/features/owner/stores/hooks/useStores";
import { InquiryCreateRequest } from "@/shared/types/inquiry";

const MAX_TITLE_LENGTH = 50;   
const MAX_CONTENT_LENGTH = 1000; 

const formSchema = z.object({
  category: z.enum(["REPORT", "SUGGESTION", "INQUIRY"]),
  title: z.string()
    .min(1, "제목을 입력해주세요.")
    .max(MAX_TITLE_LENGTH, `제목은 ${MAX_TITLE_LENGTH}자 이내로 작성해주세요.`),
  content: z.string()
    .min(1, "내용을 입력해주세요.")
    .max(MAX_CONTENT_LENGTH, `내용은 ${MAX_CONTENT_LENGTH}자 이내로 작성해주세요.`),
  storeId: z.string().optional(),
});

interface Props {
  ownerId: number;
  onCreate: (data: InquiryCreateRequest) => Promise<void>;
  isCreating: boolean;
}

export function InquiryCreateDialog({ ownerId, onCreate, isCreating }: Props) {
  const [open, setOpen] = useState(false);
  
  const { stores } = useStores(ownerId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "INQUIRY",
      title: "",
      content: "",
      storeId: "none",
    },
  });

  const titleValue = form.watch("title");
  const contentValue = form.watch("content");
  
  const currentTitleLength = titleValue ? titleValue.length : 0;
  const currentContentLength = contentValue ? contentValue.length : 0;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // ⭐️ [수정] createdAt 필드(현재 시간) 추가
    // 백엔드 DTO가 createdAt을 받을 수 있다면 이 값이 저장됩니다.
    const payload = {
      category: values.category,
      title: values.title,
      content: values.content,
      storeId: values.storeId && values.storeId !== "none" ? Number(values.storeId) : null,
      createdAt: new Date().toISOString(), 
    } as unknown as InquiryCreateRequest; // 타입 호환성을 위해 캐스팅

    await onCreate(payload);
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>문의하기</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새로운 문의 작성</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카테고리</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INQUIRY">일반 문의</SelectItem>
                      <SelectItem value="SUGGESTION">건의 사항</SelectItem>
                      <SelectItem value="REPORT">신고 하기</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>관련 사업장 (선택)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="사업장 선택 (선택사항)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">선택 안함</SelectItem>
                      {stores.map((store: any) => (
                        <SelectItem key={store.storeId} value={String(store.storeId)}>
                          {store.storeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="문의 제목을 입력하세요" 
                      className="min-h-[40px] resize-none overflow-hidden py-2" 
                      maxLength={MAX_TITLE_LENGTH}
                      {...field} 
                    />
                  </FormControl>
                  <div className="text-xs text-right text-muted-foreground mt-1">
                    {currentTitleLength} / {MAX_TITLE_LENGTH}자
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>내용</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="문의하실 내용을 상세히 적어주세요." 
                      className="min-h-[150px] resize-none"
                      maxLength={MAX_CONTENT_LENGTH}
                      {...field} 
                    />
                  </FormControl>
                  <div className="text-xs text-right text-muted-foreground mt-1">
                    {currentContentLength.toLocaleString()} / {MAX_CONTENT_LENGTH.toLocaleString()}자
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "등록 중..." : "등록하기"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}