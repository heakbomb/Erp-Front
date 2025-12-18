// modules/inquiryC/InquiryCreateDialog.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea"; 
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { CreateInquiryRequest } from "./inquiryTypes";
// 주의: useStores 등 외부 의존성이 있다면 해당 모듈 경로 확인 필요. 
// 여기서는 storeId 선택 로직이 features에 있어 단순화하거나 필요시 useStores를 가져와야 함.
// modules/storeC/useStores.ts 가 있다고 가정.
import { useStores } from "@/modules/storeC/useStores";

const MAX_TITLE_LENGTH = 50;   
const MAX_CONTENT_LENGTH = 1000; 

const formSchema = z.object({
  category: z.enum(["REPORT", "SUGGESTION", "INQUIRY"]),
  title: z.string().min(1, "제목을 입력해주세요.").max(MAX_TITLE_LENGTH),
  content: z.string().min(1, "내용을 입력해주세요.").max(MAX_CONTENT_LENGTH),
  storeId: z.string().optional(),
});

interface Props {
  ownerId: number;
  onCreate: (data: CreateInquiryRequest) => Promise<void>;
  isCreating: boolean;
}

export default function InquiryCreateDialog({ ownerId, onCreate, isCreating }: Props) {
  const [open, setOpen] = useState(false);
  
  // modules의 useStores 훅 사용 가정
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: CreateInquiryRequest = {
      category: values.category,
      title: values.title,
      content: values.content,
      storeId: values.storeId && values.storeId !== "none" ? Number(values.storeId) : null,
      createdAt: new Date().toISOString(), 
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
        <DialogHeader><DialogTitle>새로운 문의 작성</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카테고리</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="카테고리 선택" /></SelectTrigger></FormControl>
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
                    <FormControl><SelectTrigger><SelectValue placeholder="사업장 선택" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">선택 안함</SelectItem>
                      {stores?.map((store: any) => (
                        <SelectItem key={store.storeId} value={String(store.storeId)}>{store.storeName}</SelectItem>
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
                    <Textarea placeholder="제목 입력" className="min-h-[40px] resize-none py-2" maxLength={MAX_TITLE_LENGTH} {...field} />
                  </FormControl>
                  <div className="text-xs text-right text-muted-foreground">{titleValue?.length || 0} / {MAX_TITLE_LENGTH}자</div>
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
                    <Textarea placeholder="내용 입력" className="min-h-[150px] resize-none" maxLength={MAX_CONTENT_LENGTH} {...field} />
                  </FormControl>
                  <div className="text-xs text-right text-muted-foreground">{contentValue?.length || 0} / {MAX_CONTENT_LENGTH.toLocaleString()}자</div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isCreating}>{isCreating ? "등록 중..." : "등록하기"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}