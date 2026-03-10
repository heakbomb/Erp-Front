"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Label } from "@/shared/ui/label";
import { Inquiry } from "./inquiryTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry | null;
}

export default function InquiryDetailDialog({ isOpen, onClose, inquiry }: Props) {
  if (!inquiry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            문의 상세
            <Badge variant={inquiry.status === "RESPONDED" ? "default" : "secondary"}>
              {inquiry.status === "RESPONDED" ? "답변완료" : "대기중"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* 문의 정보 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">카테고리</Label>
              <div className="font-medium mt-1">{inquiry.category}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">작성일</Label>
              <div className="font-medium mt-1">
                {new Date(inquiry.createdAt).toLocaleString()}
              </div>
            </div>
            {inquiry.storeName && (
               <div className="col-span-2">
                <Label className="text-muted-foreground">관련 사업장</Label>
                <div className="font-medium mt-1">{inquiry.storeName}</div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-lg font-semibold">{inquiry.title}</Label>
            <div className="rounded-md border p-3 min-h-[100px] text-sm bg-slate-50 whitespace-pre-wrap">
              {inquiry.content}
            </div>
          </div>

          {/* 답변 영역 */}
          {inquiry.status === "RESPONDED" ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold text-blue-600">관리자 답변</Label>
                {inquiry.answeredAt && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(inquiry.answeredAt).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="rounded-md border border-blue-100 bg-blue-50/50 p-4 text-sm whitespace-pre-wrap">
                {inquiry.answer}
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-dashed p-6 text-center text-muted-foreground text-sm">
              아직 관리자가 내용을 확인 중입니다. <br/>
              조금만 기다려주시면 빠르고 정확하게 답변드리겠습니다.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}