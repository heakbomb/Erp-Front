import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Input 대신 Textarea 사용
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useStores } from "@/features/owner/stores/hooks/useStores";
import { InquiryCreateRequest } from "@/lib/types/inquiry";

// 최대 글자수 상수 정의
const MAX_TITLE_LENGTH = 50;   // 제목 제한
const MAX_CONTENT_LENGTH = 1000; // 본문 제한

// 유효성 검사 스키마
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

  // 실시간 글자수 감지
  const titleValue = form.watch("title");
  const contentValue = form.watch("content");
  
  const currentTitleLength = titleValue ? titleValue.length : 0;
  const currentContentLength = contentValue ? contentValue.length : 0;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: InquiryCreateRequest = {
      category: values.category,
      title: values.title,
      content: values.content,
      storeId: values.storeId && values.storeId !== "none" ? Number(values.storeId) : null,
    };
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
                    {/* Input 대신 Textarea를 사용하여 줄바꿈 지원 */}
                    <Textarea 
                      placeholder="문의 제목을 입력하세요" 
                      className="min-h-[40px] resize-none overflow-hidden py-2" // Input과 비슷한 높이감, 줄바꿈 시 자동 늘어남(기본동작)
                      maxLength={MAX_TITLE_LENGTH}
                      {...field} 
                    />
                  </FormControl>
                  {/* 제목 글자수 카운터 */}
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
                  {/* 본문 글자수 카운터 */}
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