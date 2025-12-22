// modules/subscriptionC/PlanList.tsx
"use client";

import { useSubscription } from "./useSubscription";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Loader2, Check } from "lucide-react";
import Link from "next/link";

export default function PlanList() {
  const { 
    currentSubscription, 
    publicPlans, 
    isSubscriptionLoading, 
    isPlansLoading, 
    handleSelectPlan, 
    cancelSubscription,
    isCancelling
  } = useSubscription();

  const isLoading = isSubscriptionLoading || isPlansLoading;

  if (isLoading) return <div className="p-20 text-center flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-8 container mx-auto max-w-6xl py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">구독 관리</h1>
          <p className="text-muted-foreground mt-1">이용 중인 플랜을 확인하고 관리하세요.</p>
        </div>
        <Link href="/owner/subscription/payment-method">
          <Button variant="outline">결제 수단 관리</Button>
        </Link>
      </div>

      {/* 현재 이용 중인 플랜 */}
      <Card className="border-primary bg-primary/5">
        <CardHeader>
          <CardTitle>현재 이용 중인 플랜</CardTitle>
          <CardDescription>
            {currentSubscription ? currentSubscription.subName : "현재 이용 중인 유료 플랜이 없습니다."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentSubscription ? (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold">₩{currentSubscription.monthlyPrice.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/월</span></p>
                <p className="text-sm text-muted-foreground mt-1">다음 결제일: {currentSubscription.expiryDate}</p>
              </div>
              <Badge variant={currentSubscription.isActive ? "default" : "secondary"}>
                {currentSubscription.isActive ? "이용 중" : "해지 예정"}
              </Badge>
            </div>
          ) : (
            <div className="flex items-center justify-between">
                <p className="text-muted-foreground">서비스의 모든 기능을 이용하시려면 플랜을 구독해주세요.</p>
                <Badge variant="outline">무료 이용 중</Badge>
            </div>
          )}
        </CardContent>
        {currentSubscription && currentSubscription.isActive && (
          <CardFooter className="border-t pt-4">
            <Button 
                variant="ghost" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10" 
                onClick={() => {
                    if(confirm("정말 구독을 해지하시겠습니까?")) {
                        cancelSubscription({ subId: currentSubscription.ownerSubId, reason: "사용자 요청" });
                    }
                }}
                disabled={isCancelling}
            >
              {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
              구독 해지
            </Button>
          </CardFooter>
        )}
      </Card>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-6">플랜 선택</h2>
        {/* 플랜 목록 */}
        <div className="grid md:grid-cols-3 gap-6">
            {publicPlans.length === 0 ? (
                <div className="col-span-3 text-center py-10 bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">이용 가능한 플랜이 없습니다.</p>
                </div>
            ) : (
                publicPlans.map((plan: any) => {
                const isCurrent = currentSubscription?.subId === plan.subId;
                const Icon = plan.icon;
                
                return (
                    <Card key={plan.subId} className={`flex flex-col relative overflow-hidden transition-all hover:shadow-lg ${isCurrent ? "border-2 border-primary shadow-md" : ""} ${plan.popular ? "border-orange-400" : ""}`}>
                    {plan.popular && (
                        <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                            인기
                        </div>
                    )}
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            {Icon && <div className="p-2 bg-primary/10 rounded-lg text-primary"><Icon className="h-5 w-5" /></div>}
                            <CardTitle>{plan.subName}</CardTitle>
                        </div>
                        <CardDescription>{plan.description || "최고의 서비스를 경험하세요"}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div className="text-3xl font-bold">
                            ₩{plan.monthlyPrice.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/월</span>
                        </div>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            {plan.features?.map((feat: string, i: number) => (
                                <li key={i} className="flex gap-2 items-start">
                                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> 
                                    <span>{feat}</span>
                                </li>
                            )) || (
                                <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> 기본 기능 제공</li>
                            )}
                        </ul>
                    </CardContent>
                    <CardFooter className="pt-4 mt-auto">
                        <Button 
                        className="w-full h-11" 
                        variant={isCurrent ? "outline" : (plan.popular ? "default" : "secondary")}
                        disabled={isCurrent}
                        onClick={() => handleSelectPlan(plan.subId)}
                        >
                        {isCurrent ? "현재 이용 중" : "시작하기"}
                        </Button>
                    </CardFooter>
                    </Card>
                );
                })
            )}
        </div>
      </div>
    </div>
  );
}