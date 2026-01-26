"use client";

import { useSubscription } from "./useSubscription";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Loader2, Check, AlertCircle, CreditCard, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Separator } from "@/shared/ui/separator";

export default function PlanList() {
  const router = useRouter();
  
  const { 
    currentSubscription, 
    publicPlans, 
    isSubscriptionLoading, 
    isPlansLoading, 
    handleSelectPlan,
    undoCancelSubscription, // ✅ 추가
    isUndoCanceling         // ✅ 추가
  } = useSubscription();

  const isLoading = isSubscriptionLoading || isPlansLoading;

  if (isLoading) {
    return (
      <div className="h-[40vh] flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary/80" />
      </div>
    );
  }

  let isExpired = false;
  let isCanceled = false;
  let isActiveSub = false;

  if (currentSubscription) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(currentSubscription.expiryDate);
    
    isExpired = expiry < today;

    if (!isExpired) {
      isCanceled = currentSubscription.canceled;
      isActiveSub = !isCanceled;
    }
  }

  // ✅ 해지 취소 핸들러 (결제 없이 상태 복구)
  const handleUndoCancel = async () => {
    if (!currentSubscription) return;
    
    // confirm 확인
    if (!confirm("구독 해지를 취소하시겠습니까?\n기존 결제 수단으로 다음 결제일에 자동 갱신됩니다.")) {
      return;
    }

    try {
      await undoCancelSubscription(currentSubscription.ownerSubId);
      // 성공 시 useSubscription의 onSuccess에서 toast 발생 및 데이터 갱신
    } catch (e) {
      // 에러 처리는 useSubscription 내부에서 수행
    }
  };

  // 테마 색상 및 스타일 정의
  const statusTheme = isExpired 
    ? { border: "border-gray-200", bg: "bg-gradient-to-br from-gray-50 to-gray-100", badge: "bg-gray-200 text-gray-700 hover:bg-gray-200", text: "text-gray-600", icon: "text-gray-400" }
    : isCanceled 
      ? { border: "border-orange-200", bg: "bg-gradient-to-br from-orange-50 to-orange-100/50", badge: "bg-orange-100 text-orange-700 hover:bg-orange-100", text: "text-orange-700", icon: "text-orange-500" }
      : { border: "border-primary/20", bg: "bg-gradient-to-br from-primary/5 via-white to-primary/5", badge: "bg-primary text-primary-foreground hover:bg-primary/90", text: "text-primary", icon: "text-primary" };

  return (
    <div className="container mx-auto max-w-6xl py-6 px-4 space-y-8">
      
      {/* 1. 헤더 영역 */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-foreground/90">구독 관리</h1>
          <p className="text-muted-foreground text-sm mt-1">
            매장 운영에 필요한 최적의 플랜을 관리하세요.
          </p>
        </div>
        <Link href="/owner/subscription/payment-method">
          <Button variant="outline" size="sm" className="gap-2 h-9 text-xs md:text-sm">
            <CreditCard className="h-3.5 w-3.5" />
            결제 수단 관리
          </Button>
        </Link>
      </div>

      <Separator className="bg-border/60" />

      {/* 2. 현재 이용 중인 플랜 카드 */}
      <section>
        <div className="flex items-center gap-2 mb-3 px-1">
          <Sparkles className={`h-4 w-4 ${statusTheme.icon}`} />
          <h2 className="text-lg font-semibold text-foreground/80">나의 구독 현황</h2>
        </div>
        
        <Card className={`overflow-hidden border shadow-sm hover:shadow-md transition-shadow ${statusTheme.border} ${statusTheme.bg}`}>
          <div className="grid md:grid-cols-[1.8fr_1fr] gap-0 divide-y md:divide-y-0 md:divide-x divide-border/50">
            {/* 좌측: 플랜 정보 */}
            <div className="p-5 md:p-6 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                   <Badge className={`px-2.5 py-0.5 text-xs font-semibold shadow-none border-0 ${statusTheme.badge}`}>
                      {isExpired ? "구독 만료" : (isCanceled ? "해지 예정" : "이용 중")}
                   </Badge>
                   {isActiveSub && (
                     <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                       <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        실시간 적용 중
                     </span>
                   )}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                  {currentSubscription ? currentSubscription.subName : "무료 이용 중"}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {currentSubscription 
                    ? "모든 프리미엄 기능을 제한 없이 이용하실 수 있습니다." 
                    : "유료 플랜을 구독하고 더 많은 기능을 이용해보세요."}
                </p>
              </div>

              {currentSubscription && (
                <div className="flex items-center gap-6 md:gap-10 pt-2">
                   <div className="space-y-0.5">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        월 결제 금액
                      </p>
                      <p className={`text-xl font-bold ${isExpired ? "text-muted-foreground" : "text-foreground"}`}>
                        ₩{currentSubscription.monthlyPrice.toLocaleString()}
                      </p>
                   </div>
                   <div className="w-px h-8 bg-border/60"></div>
                   <div className="space-y-0.5">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        {isExpired ? "만료일" : (isCanceled ? "이용 종료일" : "다음 결제일")}
                      </p>
                      <p className="text-lg font-semibold text-foreground/90">
                        {currentSubscription.expiryDate}
                      </p>
                   </div>
                </div>
              )}
            </div>

            {/* 우측: 액션 및 상태 메시지 */}
            <div className={`p-5 md:p-6 flex flex-col justify-center bg-white/40 backdrop-blur-sm`}>
              {currentSubscription ? (
                <div className="space-y-3">
                  {/* 상태별 안내 메시지 박스 */}
                  {isExpired ? (
                    <div className="bg-gray-100/80 text-gray-700 text-xs p-2.5 rounded border border-gray-200 flex gap-2 items-start">
                      <AlertCircle className="h-4 w-4 shrink-0 text-gray-500 mt-0.5" />
                      <span>구독이 만료되었습니다.<br/>다시 구독하여 서비스를 계속 이용하세요.</span>
                    </div>
                  ) : isCanceled ? (
                    <div className="bg-orange-50 text-orange-800 text-xs p-2.5 rounded border border-orange-100 flex gap-2 items-start">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-orange-500 mt-0.5" />
                      <span>해지가 예약되었습니다.<br/><b>{currentSubscription.expiryDate}</b>까지 이용 가능합니다.</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                      <span>자동 갱신 예정</span>
                      <span className="font-medium text-foreground">{currentSubscription.expiryDate}</span>
                    </div>
                  )}

                  {/* 버튼 영역 */}
                  <div className="grid gap-2">
                    {/* 1. 만료된 경우 -> 재구독 (결제 필요) */}
                    {isExpired && (
                      <Button 
                        onClick={() => handleSelectPlan(currentSubscription.subId)}
                        className="w-full h-9 font-semibold shadow-sm bg-primary hover:bg-primary/90"
                        size="sm"
                      >
                        다시 구독하기
                      </Button>
                    )}

                    {/* 2. 해지 예정 (만료 전) -> 해지 취소 (API 호출, 결제 X) */}
                    {!isExpired && isCanceled && (
                      <Button 
                        onClick={handleUndoCancel} // ✅ API 호출
                        disabled={isUndoCanceling}
                        className="w-full h-9 font-semibold shadow-sm bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        {isUndoCanceling ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> 처리 중</>
                        ) : (
                          "구독 유지하기 (해지 취소)"
                        )}
                      </Button>
                    )}

                    {/* 3. 정상 이용 중 -> 해지 버튼 */}
                    {!isExpired && !isCanceled && (
                      <Button 
                          variant="ghost" 
                          size="sm"
                          className="w-full h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                          onClick={() => router.push("/owner/subscription/cancel")}
                      >
                        구독 해지
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-3 py-2">
                   <p className="text-sm text-muted-foreground">이용 중인 유료 서비스가 없습니다.</p>
                   <Button size="sm" className="w-full h-9" onClick={() => document.getElementById('plan-grid')?.scrollIntoView({ behavior: 'smooth'})}>
                     플랜 살펴보기 <ArrowRight className="ml-2 h-3 w-3" />
                   </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </section>

      {/* 3. 플랜 선택 그리드 */}
      <section id="plan-grid" className="pt-4">
        <div className="text-center mb-6 space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight">요금제 선택</h2>
          <p className="text-muted-foreground text-sm">비즈니스 규모에 맞는 합리적인 요금제를 선택하세요.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            {publicPlans.length === 0 ? (
                <div className="col-span-3 text-center py-16 bg-muted/10 rounded-xl border border-dashed">
                    <Loader2 className="animate-spin h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">플랜 정보를 불러오고 있습니다...</p>
                </div>
            ) : (
                publicPlans.map((plan: any) => {
                  const isCurrentPlan = currentSubscription?.subId === plan.subId;
                  const Icon = plan.icon;
                  const isCurrentActive = isCurrentPlan && !isExpired && !isCanceled; 
                  const isDisabled = isCurrentActive; 
                  
                  let btnText = "시작하기";
                  let btnVariant: "default" | "outline" | "secondary" = "outline";

                  if (isCurrentPlan) {
                    if (isExpired) { btnText = "다시 시작하기"; btnVariant = "default"; }
                    else if (isCanceled) { btnText = "구독 연장하기"; btnVariant = "default"; } // 재활성화 개념
                    else { btnText = "현재 이용 중"; btnVariant = "secondary"; }
                  } else if (currentSubscription && !isExpired) {
                    btnText = "이 플랜으로 변경";
                    btnVariant = "outline";
                  } else if (plan.popular) {
                    btnVariant = "default";
                  }

                  return (
                      <Card 
                        key={plan.subId} 
                        className={`flex flex-col relative transition-all duration-300
                          ${isCurrentActive ? "border-primary ring-1 ring-primary shadow-sm bg-primary/[0.02]" : "hover:border-primary/40 hover:shadow-lg hover:-translate-y-1"}
                          ${plan.popular ? "border-t-4 border-t-orange-500" : "border-t-4 border-t-transparent"}
                        `}
                      >
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <Badge className="bg-orange-500 hover:bg-orange-600 border-0 text-[10px] px-2 py-0.5 uppercase tracking-wide shadow-sm">
                                    Most Popular
                                </Badge>
                            </div>
                        )}

                        <CardHeader className="text-center pb-2 pt-6 px-4">
                            <div className={`mx-auto mb-3 p-2.5 rounded-full w-fit ${isCurrentActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                              {Icon && <Icon className="h-5 w-5" />}
                            </div>
                            <CardTitle className="text-lg font-bold">{plan.subName}</CardTitle>
                            <CardDescription className="text-xs min-h-[2.5rem] flex items-center justify-center px-2">
                                {plan.description}
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="flex-1 text-center space-y-4 px-4 pb-4">
                            <div className="flex items-baseline justify-center gap-0.5">
                                <span className="text-3xl font-extrabold tracking-tight">₩{plan.monthlyPrice.toLocaleString()}</span>
                                <span className="text-muted-foreground text-xs font-medium">/월</span>
                            </div>
                            
                            <Separator className="my-2" />

                            <ul className="space-y-2.5 text-left px-2">
                                {plan.features?.map((feat: string, i: number) => (
                                    <li key={i} className="flex gap-2.5 text-sm text-muted-foreground/90 items-start">
                                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> 
                                        <span className="text-xs md:text-sm">{feat}</span>
                                    </li>
                                )) || (
                                    <li className="flex gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-green-500" /> 기본 기능 제공</li>
                                )}
                            </ul>
                        </CardContent>
                        
                        <CardFooter className="pt-2 pb-6 px-6">
                            <Button 
                              className={`w-full h-10 text-sm font-semibold shadow-sm transition-colors ${isCurrentActive ? 'opacity-80' : ''}`}
                              variant={btnVariant}
                              disabled={isDisabled}
                              onClick={() => {
                                // 만약 해지 예정 상태인 자신의 플랜을 카드에서 클릭했다면 -> 해지 취소 로직 실행
                                if (isCurrentPlan && !isExpired && isCanceled) {
                                  handleUndoCancel();
                                } else {
                                  handleSelectPlan(plan.subId);
                                }
                              }}
                            >
                              {btnText}
                            </Button>
                        </CardFooter>
                      </Card>
                  );
                })
            )}
        </div>
      </section>
    </div>
  );
}