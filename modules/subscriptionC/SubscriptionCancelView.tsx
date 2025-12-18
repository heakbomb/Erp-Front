// modules/subscriptionC/SubscriptionCancelView.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { ArrowLeft, Loader2 } from "lucide-react";
import { subscriptionApi } from "./subscriptionApi"; 
import { useToast } from "@/shared/ui/use-toast";

const reasons = [
  "가격이 부담됩니다",
  "기능이 부족합니다",
  "사용 빈도가 낮습니다",
  "다른 서비스를 이용할 예정입니다",
  "기타"
];

export default function SubscriptionCancelView() {
  const router = useRouter();
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  // useSubscription 훅을 쓰거나 직접 API 호출
  // 여기서는 상세 사유 전송을 위해 직접 API 호출 예시
  const handleCancel = async () => {
    if (!reason) return alert("취소 사유를 선택해주세요.");
    if (!confirm("정말 구독을 해지하시겠습니까?")) return;

    setLoading(true);
    try {
      // API에 사유 전달 (API가 지원한다면)
      // ownerSubId는 Context나 API에서 조회 필요. 임시로 하드코딩 혹은 로직 추가.
      // 편의상 settingsApi.cancelSubscription() 등을 호출한다고 가정
      await subscriptionApi.cancelSubscription(999, { reason, feedback }); // 999: dummy ID or fetch
      
      toast({ title: "해지 완료", description: "구독이 정상적으로 해지되었습니다." });
      router.push("/owner/subscription");
    } catch (e: any) {
      toast({ variant: "destructive", title: "오류", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> 돌아가기
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>구독 해지</CardTitle>
          <CardDescription>해지하시는 이유를 알려주시면 서비스 개선에 큰 도움이 됩니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>해지 사유</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {reasons.map((r) => (
                <div key={r} className="flex items-center space-x-2">
                  <RadioGroupItem value={r} id={r} />
                  <Label htmlFor={r}>{r}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
             <Label>추가 의견 (선택)</Label>
             <Textarea 
               placeholder="바라는 점이나 불편했던 점을 적어주세요." 
               value={feedback}
               onChange={(e) => setFeedback(e.target.value)}
             />
          </div>

          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={handleCancel} 
            disabled={loading || !reason}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            구독 해지 완료
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}