"use client";

import { useSubscription } from "./useSubscription";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Loader2, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PlanList() {
  const router = useRouter();
  
  // 커스텀 훅에서 필요한 데이터와 함수들을 가져옵니다.
  const { 
    currentSubscription, 
    publicPlans, 
    isSubscriptionLoading, 
    isPlansLoading, 
    handleSelectPlan // ✅ 결제 페이지로 이동시키는 핵심 함수
  } = useSubscription();

  const isLoading = isSubscriptionLoading || isPlansLoading;

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="p-20 text-center flex justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  // 해지 신청 여부 판단 (백엔드 DTO의 canceled 필드)
  const isCanceled = currentSubscription?.canceled;

  return (
    <div className="space-y-8 container mx-auto max-w-6xl py-6">
      
      {/* 상단 헤더 영역 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">구독 관리</h1>
          <p className="text-muted-foreground mt-1">이용 중인 플랜을 확인하고 관리하세요.</p>
        </div>
        <Link href="/owner/subscription/payment-method">
          <Button variant="outline">결제 수단 관리</Button>
        </Link>
      </div>

      {/* 1. 현재 이용 중인 플랜 카드 */}
      <Card className={`border-l-4 ${isCanceled ? "border-l-orange-500 bg-orange-50/20" : "border-l-green-500 bg-primary/5"}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            현재 이용 중인 플랜
            {currentSubscription && (
              <Badge 
                variant={isCanceled ? "secondary" : "default"} 
                className={isCanceled ? "bg-orange-100 text-orange-700 hover:bg-orange-100" : ""}
              >
                {isCanceled ? "해지 예정 (이용 가능)" : "이용 중"}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {currentSubscription ? currentSubscription.subName : "현재 이용 중인 유료 플랜이 없습니다."}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {currentSubscription ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">
                    ₩{currentSubscription.monthlyPrice.toLocaleString()} 
                    <span className="text-sm font-normal text-muted-foreground">/월</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isCanceled 
                      ? `서비스 이용 가능: ${currentSubscription.expiryDate} 까지` 
                      : `다음 결제일: ${currentSubscription.expiryDate}`}
                  </p>
                </div>
              </div>
              
              {/* 해지 신청 상태일 때 안내 메시지 */}
              {isCanceled && (
                <div className="text-sm text-orange-600 bg-orange-100/50 p-3 rounded-md">
                  💡 구독 해지가 예약되었습니다. 만료일 전까지 서비스를 계속 이용하실 수 있으며, 
                  아래 <strong>[구독 연장]</strong> 버튼을 통해 다시 구독을 유지하실 수 있습니다.
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
                <p className="text-muted-foreground">서비스의 모든 기능을 이용하시려면 플랜을 구독해주세요.</p>
                <Badge variant="outline">무료 이용 중</Badge>
            </div>
          )}
        </CardContent>
        
        {/* 버튼 영역 (해지/연장) */}
        {currentSubscription && (
          <CardFooter className="border-t pt-4 flex gap-2">
            {/* 좌측: 해지 버튼 */}
            <Button 
                variant="ghost" 
                // 해지 상태면 비활성화 및 스타일 변경
                className={`text-destructive hover:text-destructive hover:bg-destructive/10 ${isCanceled ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isCanceled}
                onClick={() => router.push("/owner/subscription/cancel")}
            >
              {isCanceled ? "해지 신청 완료" : "구독 해지"}
            </Button>

            {/* 우측: 구독 연장 버튼 (해지 상태일 때만 표시) */}
            {isCanceled && (
              <Button 
                // ✅ 중요: 단순 이동이 아니라 상품 ID를 가지고 결제 페이지로 이동
                onClick={() => handleSelectPlan(currentSubscription.subId)}
                className="bg-green-600 hover:bg-green-700 text-white ml-auto"
              >
                구독 연장 (해지 취소)
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-6">플랜 선택</h2>
        
        {/* 2. 하단 플랜 목록 Grid */}
        <div className="grid md:grid-cols-3 gap-6">
            {publicPlans.length === 0 ? (
                <div className="col-span-3 text-center py-10 bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">이용 가능한 플랜이 없습니다.</p>
                </div>
            ) : (
                publicPlans.map((plan: any) => {
                  // 현재 이용 중인 플랜인지 확인
                  const isCurrent = currentSubscription?.subId === plan.subId;
                  const Icon = plan.icon;
                  
                  // 버튼 비활성화 로직:
                  // (현재 플랜임) AND (해지 신청 안 함) -> 이미 구독 중이므로 버튼 비활성
                  // 해지 신청 상태라면 -> 다시 구독해야 하므로 버튼 활성
                  const isDisabled = isCurrent && !isCanceled;
                  
                  // 버튼 텍스트 결정
                  let btnText = "시작하기";
                  if (isCurrent) {
                    btnText = isCanceled ? "구독 연장" : "현재 이용 중";
                  } else if (currentSubscription) {
                    btnText = "플랜 변경";
                  }

                  return (
                      <Card 
                        key={plan.subId} 
                        className={`flex flex-col relative overflow-hidden transition-all hover:shadow-lg ${isCurrent && !isCanceled ? "border-2 border-primary shadow-md" : ""} ${plan.popular ? "border-orange-400" : ""}`}
                      >
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
                              variant={isDisabled ? "outline" : (plan.popular ? "default" : "secondary")}
                              disabled={isDisabled}
                              onClick={() => handleSelectPlan(plan.subId)}
                            >
                              {btnText}
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