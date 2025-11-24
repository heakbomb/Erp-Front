// features/owner/inquiries/components/InquiryView.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useInquiries } from "../hooks/useInquiries";
import { InquiryList } from "./InquiryList";
import { InquiryCreateDialog } from "./InquiryCreateDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function InquiryView() {
  const { user } = useAuth();
  // [수정 2] user 객체 구조에 맞게 ID 접근 (owner_id 사용 및 타입 가드)
  // User 타입이 Owner | Employee 이므로, role 체크 후 owner_id 접근
  const ownerId = user && user.role === 'OWNER' ? user.owner_id : undefined;

  const { inquiries, isLoading, createInquiry, isCreating, deleteInquiry } = useInquiries(ownerId);

  // 로그인 안 했거나 사장님이 아닌 경우 처리
  if (!user || user.role !== 'OWNER' || !ownerId) {
    return <div className="p-8 text-center">로그인이 필요한 서비스입니다.</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">1:1 문의</h2>
            <p className="text-muted-foreground mt-1">
                시스템 이용 중 궁금한 점이나 불편사항을 문의해주세요.
            </p>
        </div>
        <InquiryCreateDialog 
            ownerId={ownerId} 
            onCreate={createInquiry} 
            isCreating={isCreating} 
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>문의 내역</CardTitle>
          <CardDescription>총 {inquiries.length}건의 문의가 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="space-y-3">
               <Skeleton className="h-12 w-full" />
               <Skeleton className="h-12 w-full" />
               <Skeleton className="h-12 w-full" />
             </div>
          ) : (
            <InquiryList inquiries={inquiries} onDelete={deleteInquiry} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}