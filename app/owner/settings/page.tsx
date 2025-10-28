import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Bell, Lock, User, CreditCard } from "lucide-react"
import Link from "next/link"

export default function OwnerSettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">설정</h1>
        <p className="text-muted-foreground">계정 및 시스템 설정을 관리합니다</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              <CardTitle>프로필 설정</CardTitle>
            </div>
            <CardDescription>개인 정보를 수정합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">이름</Label>
              <Input id="name" defaultValue="김사장" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" type="email" defaultValue="kim@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input id="phone" defaultValue="010-1234-5678" />
            </div>
            <Button>저장</Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Lock className="mr-2 h-5 w-5" />
              <CardTitle>보안 설정</CardTitle>
            </div>
            <CardDescription>비밀번호 및 보안 옵션을 관리합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">현재 비밀번호</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">새 비밀번호</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">비밀번호 확인</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button>비밀번호 변경</Button>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">2단계 인증</p>
                <p className="text-sm text-muted-foreground">추가 보안을 위해 2단계 인증을 활성화합니다</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              <CardTitle>알림 설정</CardTitle>
            </div>
            <CardDescription>알림 수신 방법을 설정합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">재고 부족 알림</p>
                <p className="text-sm text-muted-foreground">재고가 안전 재고 이하로 떨어지면 알림</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">직원 신청 알림</p>
                <p className="text-sm text-muted-foreground">새로운 직원 신청이 있을 때 알림</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">AI 인사이트 알림</p>
                <p className="text-sm text-muted-foreground">AI 추천 및 예측 결과 알림</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">이메일 알림</p>
                <p className="text-sm text-muted-foreground">중요한 알림을 이메일로 수신</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Subscription Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              <CardTitle>구독 관리</CardTitle>
            </div>
            <CardDescription>현재 구독 플랜 및 결제 정보</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">프리미엄 플랜</p>
                  <p className="text-sm text-muted-foreground">월 49,000원</p>
                </div>
                <Link href="/owner/subscription">
                  <Button variant="outline">플랜 변경</Button>
                </Link>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">다음 결제일</span>
                  <span className="font-medium">2024년 4월 15일</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">결제 수단</span>
                  <span className="font-medium">카드 **** 1234</span>
                </div>
              </div>
            </div>
            <Link href="/owner/subscription/payment-method">
              <Button variant="outline" className="w-full bg-transparent">
                결제 수단 변경
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
