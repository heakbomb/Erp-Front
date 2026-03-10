"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "./useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Loader2, AlertTriangle, AlertCircle, ArrowLeft, Trash2 } from "lucide-react"; // 아이콘 추가
import { toast } from "sonner";
import { Separator } from "@/shared/ui/separator"; // 구분선 추가

export default function SubscriptionCancelView() {
  const router = useRouter();
  const { currentSubscription, cancelSubscription } = useSubscription();
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cancelReasons = [
    "더 이상 서비스가 필요하지 않아요",
    "이용 요금이 부담스러워요",
    "다른 서비스를 이용할 예정이에요",
    "기능이 부족하거나 불편해요",
    "기타 (직접 입력)"
  ];

  const handleCancel = async () => {
    if (!currentSubscription) return;
    if (!reason) {
      toast.error("해지 사유를 선택해주세요.");
      return;
    }

    // confirm 대신 커스텀 모달을 사용하면 더 좋겠지만, 일단 기본 confirm 유지
    if (!confirm("정말 구독을 해지하시겠습니까?\n해지 하셔도 남은 기간 동안은 계속 이용하실 수 있습니다.")) {
      return;
    }

    setIsSubmitting(true);

    try {
      await cancelSubscription({ 
        subId: currentSubscription.ownerSubId, 
        reason: reason 
      });

      alert("구독 해지가 예약되었습니다.\n남은 기간 동안 서비스는 계속 이용 가능합니다.");
      router.push("/owner/subscription");
      router.refresh();

    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 409) {
        alert("이미 해지 신청된 구독입니다.\n구독 관리 페이지로 이동합니다.");
        router.push("/owner/subscription");
        router.refresh();
      } else {
        // useSubscription hook에서 에러 toast 처리
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentSubscription) {
     return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // 이미 해지된 상태 화면도 디자인 개선
  if (currentSubscription.canceled) {
    return (
      <div className="container max-w-lg py-20 mx-auto">
        <Card className="border-yellow-400/50 bg-yellow-50/50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 text-yellow-700">
              <AlertCircle className="h-6 w-6" />
              <CardTitle className="text-xl">이미 해지 신청된 구독입니다</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-yellow-800/80 pb-6">
            <p>
              현재 구독은 <strong>{currentSubscription.expiryDate}</strong>까지 이용 가능하며,<br/>
              그 이후에는 자동으로 결제되지 않습니다.
            </p>
          </CardContent>
          <Separator className="bg-yellow-200/50" />
          <CardFooter className="pt-6 justify-center">
             <Button onClick={() => router.push('/owner/subscription')} variant="outline" className="border-yellow-300 hover:bg-yellow-100/50 text-yellow-800">
               <ArrowLeft className="mr-2 h-4 w-4" /> 구독 관리로 돌아가기
             </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-xl py-16 mx-auto">
      <Card className="border-destructive/30 shadow-xl shadow-destructive/5 overflow-hidden">
        <CardHeader className="bg-destructive/5 border-b border-destructive/10 pb-8 pt-10 px-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-destructive">정말 구독을 해지하시겠습니까?</CardTitle>
          <CardDescription className="text-base mt-2 text-destructive/80">
            해지하시더라도 <strong>{currentSubscription.expiryDate}</strong>까지는 
            <br />
            <strong>{currentSubscription.subName}</strong>의 모든 혜택을 이용하실 수 있습니다.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-8 px-8 space-y-6">
          <div className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              해지하시는 이유를 알려주세요
            </Label>
            <RadioGroup onValueChange={setReason} className="flex flex-col space-y-3 pt-2">
              {cancelReasons.map((r) => (
                <Label 
                  key={r} 
                  htmlFor={r} 
                  className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${reason === r ? 'border-destructive/50 bg-destructive/5' : 'border-border hover:bg-accent/50'}`}
                >
                  <RadioGroupItem value={r} id={r} className="text-destructive border-muted-foreground/30" />
                  <span className="font-normal text-base">{r}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="flex gap-4 justify-end bg-accent/20 p-6 px-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="hover:bg-accent/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기 (구독 유지)
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCancel}
            disabled={isSubmitting || !reason}
            className="bg-destructive hover:bg-destructive/90 px-6 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 처리 중...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" /> 해지 예약하기
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}