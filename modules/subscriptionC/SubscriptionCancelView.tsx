"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "./useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner"; 

export default function SubscriptionCancelView() {
  const router = useRouter();
  const { currentSubscription } = useSubscription();
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
      // 입력값 검증은 toast로 충분하지만, 원하시면 이것도 alert로 통일 가능합니다.
      toast.error("해지 사유를 선택해주세요."); 
      return;
    }

    if (!confirm("정말 구독을 해지하시겠습니까?\n해지 하셔도 남은 기간 동안은 계속 이용하실 수 있습니다.")) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`http://localhost:8080/owner/subscriptions/${currentSubscription.ownerSubId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: reason }),
      });

      // [수정 포인트] 409 Conflict 발생 시 (이미 해지됨)
      if (res.status === 409) {
        // toast 대신 alert 사용 -> 사용자가 확인 누를 때까지 대기
        alert("이미 해지 신청된 구독입니다.\n구독 관리 페이지로 이동합니다.");
        
        router.push("/owner/subscription");
        router.refresh(); // 데이터 갱신
        return;
      }

      if (res.ok) {
        // 성공 시에도 확실하게 알림
        alert("구독 해지가 예약되었습니다.\n남은 기간 동안 서비스는 계속 이용 가능합니다.");
        
        router.push("/owner/subscription");
        router.refresh();
      } else {
        const errorMsg = await res.text();
        // 실패 에러도 alert로 띄우기
        alert(`해지 처리에 실패했습니다.\n사유: ${errorMsg}`);
      }
    } catch (error) {
      console.error(error);
      alert("서버 통신 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentSubscription) {
     return <div className="p-10 text-center"><Loader2 className="animate-spin inline-block" /> 정보 확인 중...</div>;
  }

  // 만약 이 페이지에 들어왔는데 이미 해지된 상태라면 바로 안내하고 버튼 비활성화
  // (백엔드 데이터가 canceled: true인 경우)
  if (currentSubscription.canceled) {
    return (
      <div className="container max-w-2xl py-10 mx-auto text-center">
        <Card className="border-yellow-400 bg-yellow-50">
          <CardHeader>
            <AlertTriangle className="h-10 w-10 text-yellow-600 mx-auto mb-2" />
            <CardTitle className="text-yellow-800">이미 해지 신청된 구독입니다</CardTitle>
            <CardDescription className="text-yellow-700">
              만료일({currentSubscription.expiryDate})까지 이용 가능하며,<br/>
              이후에는 자동 결제되지 않습니다.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center pt-4">
             <Button onClick={() => router.push('/owner/subscription')}>
               구독 관리로 돌아가기
             </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-10 mx-auto">
      <Card className="border-destructive/50 shadow-lg">
        <CardHeader className="bg-destructive/5 border-b border-destructive/10">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-6 w-6" />
            <h2 className="text-xl font-bold">구독 해지</h2>
          </div>
          <CardTitle>정말 구독을 해지하시겠습니까?</CardTitle>
          <CardDescription>
            해지하시더라도 <strong>{currentSubscription.expiryDate}</strong>까지는 
            <br />
            <strong>{currentSubscription.subName}</strong>의 모든 혜택을 이용하실 수 있습니다.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold">해지하시는 이유를 알려주세요</Label>
            <RadioGroup onValueChange={setReason} className="flex flex-col space-y-2">
              {cancelReasons.map((r) => (
                <div key={r} className="flex items-center space-x-2">
                  <RadioGroupItem value={r} id={r} />
                  <Label htmlFor={r} className="font-normal cursor-pointer">{r}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>

        <CardFooter className="flex gap-3 justify-end border-t bg-gray-50/50 p-6">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            돌아가기 (구독 유지)
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCancel}
            disabled={isSubmitting || !reason}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 처리 중
              </>
            ) : (
              "해지 예약하기"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}