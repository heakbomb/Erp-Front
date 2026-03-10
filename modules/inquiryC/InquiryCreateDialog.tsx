"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { useInquiries } from "./useInquiries";
import { InquiryCategory } from "./inquiryTypes";
import { useStores } from "@/modules/storeC/useStores"; // 내 사업장 목록 불러오기

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function InquiryCreateDialog({ isOpen, onClose }: Props) {
  const { createInquiry, isCreating } = useInquiries();
  const { stores } = useStores(); // 사업장 선택을 위해

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<InquiryCategory>("INQUIRY");
  const [selectedStoreId, setSelectedStoreId] = useState<string | "none">("none");
  const [isSecret, setIsSecret] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    // [핵심 수정] storeId가 "none"이거나 값이 없으면 undefined로 처리
    const storeIdValue = selectedStoreId === "none" ? undefined : Number(selectedStoreId);

    await createInquiry({
      title,
      content,
      category,
      storeId: storeIdValue, // 여기서 null 에러 해결
      isSecret
    });

    onClose();
    // 초기화
    setTitle("");
    setContent("");
    setCategory("INQUIRY");
    setSelectedStoreId("none");
    setIsSecret(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 문의 등록</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>카테고리</Label>
            <Select value={category} onValueChange={(val: InquiryCategory) => setCategory(val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INQUIRY">일반 문의</SelectItem>
                <SelectItem value="SUGGESTION">건의 사항</SelectItem>
                <SelectItem value="REPORT">신고 하기</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>관련 사업장 (선택)</Label>
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger>
                <SelectValue placeholder="선택 없음" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">선택 없음</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.storeId} value={String(store.storeId)}>
                    {store.storeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>제목</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" />
          </div>

          <div className="grid gap-2">
            <Label>내용</Label>
            <Textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="문의 내용을 자세히 적어주세요" 
              className="h-32"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="secret" 
              checked={isSecret} 
              onCheckedChange={(checked) => setIsSecret(checked as boolean)} 
            />
            <Label htmlFor="secret">비공개 글</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? "등록 중..." : "등록하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}