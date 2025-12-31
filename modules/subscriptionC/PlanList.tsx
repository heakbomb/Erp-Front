"use client";

import { useSubscription } from "./useSubscription";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Loader2, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PlanList() {
  const router = useRouter();
  
  const { 
    currentSubscription, 
    publicPlans, 
    isSubscriptionLoading, 
    isPlansLoading, 
    handleSelectPlan 
  } = useSubscription();

  const isLoading = isSubscriptionLoading || isPlansLoading;

  if (isLoading) {
    return (
      <div className="p-20 text-center flex justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  // ✅ [수정 핵심] 날짜 기반 상태 계산 로직
  let isExpired = false;
  let isCanceled = false;
  let isActiveSub = false;

  if (currentSubscription) {
    // 1. 날짜 비교 (YYYY-MM-DD 문자열 비교)
    // 오늘 날짜 구하기 (시간 제거)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 만료일 파싱
    const expiry = new Date(currentSubscription.expiryDate);
    
    // 만료일이 오늘보다 이전이면 '만료됨' (expiry < today)
    // 예: 만료일 12/24, 오늘 12/25 -> 만료됨
    // 예: 만료일 12/25, 오늘 12/25 -> 이용 가능 (보통 당일까지는 줌)
    isExpired = expiry < today;

    // 2. 해지 여부 (만료되지 않았을 때만 체크)
    if (!isExpired) {
      isCanceled = currentSubscription.canceled;
      isActiveSub = !isCanceled;
    }
  }

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

      {/* 1. 현재 이용 중인 플랜 카드 */}
      <Card className={`border-l-4 shadow-sm ${
          isExpired ? "border-l-gray-400 bg-gray-50" :  // 만료됨 -> 회색
          isCanceled ? "border-l-orange-500 bg-orange-50/20" : // 해지 예정 -> 주황색
          "border-l-green-500 bg-primary/5" // 정상 구독 -> 초록색
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            현재 이용 중인 플랜
            {currentSubscription && (
              <Badge 
                variant={isExpired ? "secondary" : (isCanceled ? "secondary" : "default")} 
                className={
                  isExpired ? "bg-gray-200 text-gray-600 hover:bg-gray-200" :
                  isCanceled ? "bg-orange-100 text-orange-700 hover:bg-orange-100" : ""
                }
              >
                {/* 상태 텍스트 표시 우선순위: 만료 > 해지예정 > 이용중 */}
                {isExpired ? "구독 만료" : (isCanceled ? "해지 예정 (이용 가능)" : "이용 중")}
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
                  <p className={`text-2xl font-bold ${isExpired ? "text-gray-500" : ""}`}>
                    ₩{currentSubscription.monthlyPrice.toLocaleString()} 
                    <span className="text-sm font-normal text-muted-foreground">/월</span>
                  </p>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {isExpired 
                      ? `만료일: ${currentSubscription.expiryDate}` 
                      : (isCanceled 
                          ? `서비스 이용 가능: ${currentSubscription.expiryDate} 까지` 
                          : `다음 결제일: ${currentSubscription.expiryDate}`
                        )
                    }
                  </p>
                </div>
              </div>
              
              {/* 상태별 안내 메시지 (만료 상태가 최우선) */}
              {isExpired ? (
                <div className="text-sm text-gray-600 bg-gray-200/50 p-3 rounded-md flex gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>
                    구독이 만료되었습니다. 서비스를 계속 이용하시려면 재구독 해주세요.
                  </span>
                </div>
              ) : isCanceled ? (
                <div className="text-sm text-orange-600 bg-orange-100/50 p-3 rounded-md flex gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>
                    구독 해지가 예약되었습니다. 만료일 전까지 서비스를 이용하실 수 있습니다.
                  </span>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center justify-between">
                <p className="text-muted-foreground">서비스의 모든 기능을 이용하시려면 플랜을 구독해주세요.</p>
                <Badge variant="outline">무료 이용 중</Badge>
            </div>
          )}
        </CardContent>
        
        {/* 버튼 영역 */}
        {currentSubscription && (
          <CardFooter className="border-t pt-4 flex gap-2">
            {/* 만료되지 않았을 때만 해지 버튼 표시 */}
            {!isExpired && (
              <Button 
                  variant="ghost" 
                  className={`text-destructive hover:text-destructive hover:bg-destructive/10 ${isCanceled ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isCanceled}
                  onClick={() => router.push("/owner/subscription/cancel")}
              >
                {isCanceled ? "해지 신청 완료" : "구독 해지"}
              </Button>
            )}

            {/* 재구독/연장 버튼: 만료되었거나(isExpired) 해지 예정(isCanceled)일 때 표시 */}
            {(isExpired || isCanceled) && (
              <Button 
                onClick={() => handleSelectPlan(currentSubscription.subId)}
                className={`text-white ml-auto ${isExpired ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}
              >
                {isExpired ? "다시 구독하기" : "구독 연장 (해지 취소)"}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-6">플랜 선택</h2>
        <div className="grid md:grid-cols-3 gap-6">
            {publicPlans.length === 0 ? (
                <div className="col-span-3 text-center py-10 bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">이용 가능한 플랜이 없습니다.</p>
                </div>
            ) : (
                publicPlans.map((plan: any) => {
                  const isCurrentPlan = currentSubscription?.subId === plan.subId;
                  const Icon = plan.icon;
                  
                  // 버튼 비활성화 로직:
                  // 만료됨(isExpired) -> 활성화 (재구독)
                  // 해지예정(isCanceled) -> 활성화 (연장)
                  // 그 외 정상 이용 중인 현재 플랜 -> 비활성화
                  
                  // 현재 이용 중(정상)인 플랜만 버튼을 막습니다.
                  const isCurrentActive = isCurrentPlan && !isExpired && !isCanceled; 
                  const isDisabled = isCurrentActive; 
                  
                  let btnText = "시작하기";
                  if (isCurrentPlan) {
                    if (isExpired) btnText = "재구독 하기";
                    else if (isCanceled) btnText = "구독 연장";
                    else btnText = "현재 이용 중";
                  } else if (currentSubscription && !isExpired) {
                    btnText = "플랜 변경";
                  }

                  return (
                      <Card 
                        key={plan.subId} 
                        className={`flex flex-col relative overflow-hidden transition-all hover:shadow-lg ${isCurrentActive ? "border-2 border-primary shadow-md" : ""} ${plan.popular ? "border-orange-400" : ""}`}
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