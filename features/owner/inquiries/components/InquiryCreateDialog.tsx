// features/owner/inquiries/components/InquiryCreateDialog.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useStores } from "@/features/owner/stores/hooks/useStores"; // 기존 훅 재사용
import { InquiryCreateRequest } from "@/lib/types/inquiry";

// 유효성 검사 스키마
const formSchema = z.object({
  category: z.enum(["REPORT", "SUGGESTION", "INQUIRY"]),
  title: z.string().min(1, "제목을 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요."),
  storeId: z.string().optional(), // Select value는 string으로 처리됨
});

interface Props {
  ownerId: number;
  onCreate: (data: InquiryCreateRequest) => Promise<void>;
  isCreating: boolean;
}

export function InquiryCreateDialog({ ownerId, onCreate, isCreating }: Props) {
  const [open, setOpen] = useState(false);
  
  // 내 사업장 목록 불러오기 (사업장 선택용)
  const { stores } = useStores(ownerId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "INQUIRY",
      title: "",
      content: "",
      storeId: "none", // 'none'일 경우 사업장 선택 안함
    },
  });
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
      <DialogContent className="sm:max-w-[500px]">
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
                    <Input placeholder="문의 제목을 입력하세요" {...field} />
                  </FormControl>
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
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
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