// modules/settingsC/OwnerSettingsView.tsx
"use client";

import Link from "next/link";
import { useOwnerSettings } from "./useOwnerSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Separator } from "@/shared/ui/separator";
import { Bell, Lock, User, CreditCard, Loader2 } from "lucide-react";

export default function OwnerSettingsView() {
  const {
    profile, security, notifications, subscription,
    loading, error,
    updateProfileField, toggleNotification, toggleTwoFactor,
    saveProfile, saveNotifications, saveSecurity
  } = useOwnerSettings();

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">설정</h1>
        <p className="text-muted-foreground">계정 및 시스템 설정을 관리합니다</p>
      </div>

      {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}

      <div className="grid gap-6">
        {/* 프로필 설정 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>프로필 설정</CardTitle>
            </div>
            <CardDescription>개인 정보를 수정합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">이름</Label>
              <Input id="name" value={profile.name} onChange={(e) => updateProfileField("name", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" type="email" value={profile.email} onChange={(e) => updateProfileField("email", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input id="phone" value={profile.phone} onChange={(e) => updateProfileField("phone", e.target.value)} />
            </div>
            <Button onClick={saveProfile} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
              저장
            </Button>
          </CardContent>
        </Card>

        {/* 보안 설정 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>보안 설정</CardTitle>
            </div>
            <CardDescription>비밀번호 및 보안 옵션을 관리합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2"><Label htmlFor="current-pw">현재 비밀번호</Label><Input id="current-pw" type="password" /></div>
            <div className="grid gap-2"><Label htmlFor="new-pw">새 비밀번호</Label><Input id="new-pw" type="password" /></div>
            <div className="grid gap-2"><Label htmlFor="confirm-pw">비밀번호 확인</Label><Input id="confirm-pw" type="password" /></div>
            <Button type="button" onClick={saveSecurity} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
              비밀번호 변경
            </Button>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">2단계 인증</p>
                <p className="text-sm text-muted-foreground">추가 보안을 위해 2단계 인증을 활성화합니다</p>
              </div>
              <Switch checked={security.twoFactorEnabled} onCheckedChange={toggleTwoFactor} />
            </div>
          </CardContent>
        </Card>

        {/* 알림 설정 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>알림 설정</CardTitle>
            </div>
            <CardDescription>알림 수신 방법을 설정합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "stockLow", label: "재고 부족 알림", desc: "재고가 안전 재고 이하로 떨어지면 알림" },
              { key: "employeeRequest", label: "직원 신청 알림", desc: "새로운 직원 신청이 있을 때 알림" },
              { key: "aiInsights", label: "AI 인사이트 알림", desc: "AI 추천 및 예측 결과 알림" },
              { key: "emailNotification", label: "이메일 알림", desc: "중요한 알림을 이메일로 수신" },
            ].map((item) => (
              <div key={item.key}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch 
                    checked={notifications[item.key as keyof typeof notifications]} 
                    onCheckedChange={(checked) => toggleNotification(item.key as keyof typeof notifications, checked)} 
                  />
                </div>
                {item.key !== "emailNotification" && <Separator className="my-4" />}
              </div>
            ))}

            <Button type="button" className="mt-4" onClick={saveNotifications} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
              알림 설정 저장
            </Button>
          </CardContent>
        </Card>

        {/* 구독 관리 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle>구독 관리</CardTitle>
            </div>
            <CardDescription>현재 구독 플랜 및 결제 정보</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{subscription.planName}</p>
                  <p className="text-sm text-muted-foreground">월 {subscription.pricePerMonth.toLocaleString()}원</p>
                </div>
                <Link href="/owner/subscription">
                  <Button variant="outline">플랜 변경</Button>
                </Link>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">다음 결제일</span>
                  <span className="font-medium">{subscription.nextBillingDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">결제 수단</span>
                  <span className="font-medium">{subscription.maskedCard}</span>
                </div>
              </div>
            </div>
            <Link href="/owner/subscription/payment-method">
              <Button variant="outline" className="w-full">결제 수단 변경</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}