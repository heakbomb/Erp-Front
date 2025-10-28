"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, User, ArrowLeft } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export function SignupForm() {
  const [userType, setUserType] = useState<"owner" | "employee">("owner")

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1">
        <Link
          href="/login"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          로그인으로 돌아가기
        </Link>
        <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
        <CardDescription>새 계정을 만들어 시작하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={userType} onValueChange={(v) => setUserType(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="owner" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              사장
            </TabsTrigger>
            <TabsTrigger value="employee" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              직원
            </TabsTrigger>
          </TabsList>

          <TabsContent value="owner" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="owner-signup-username">아이디</Label>
              <Input id="owner-signup-username" placeholder="아이디를 입력하세요" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner-signup-email">이메일</Label>
              <Input id="owner-signup-email" type="email" placeholder="이메일을 입력하세요" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner-signup-phone">전화번호</Label>
              <Input id="owner-signup-phone" type="tel" placeholder="010-0000-0000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner-signup-password">비밀번호</Label>
              <Input id="owner-signup-password" type="password" placeholder="비밀번호를 입력하세요" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner-signup-password-confirm">비밀번호 확인</Label>
              <Input id="owner-signup-password-confirm" type="password" placeholder="비밀번호를 다시 입력하세요" />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="owner-terms" />
              <label htmlFor="owner-terms" className="text-sm text-muted-foreground cursor-pointer">
                이용약관 및 개인정보처리방침에 동의합니다
              </label>
            </div>
            <Button className="w-full" size="lg">
              사장 계정 만들기
            </Button>
          </TabsContent>

          <TabsContent value="employee" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee-signup-name">이름</Label>
              <Input id="employee-signup-name" placeholder="이름을 입력하세요" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee-signup-email">이메일</Label>
              <Input id="employee-signup-email" type="email" placeholder="이메일을 입력하세요" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee-signup-phone">전화번호</Label>
              <Input id="employee-signup-phone" type="tel" placeholder="010-0000-0000" />
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">또는 소셜 계정으로 가입</p>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="w-full bg-transparent">
                  구글
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  카카오
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  네이버
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="employee-terms" />
              <label htmlFor="employee-terms" className="text-sm text-muted-foreground cursor-pointer">
                이용약관 및 개인정보처리방침에 동의합니다
              </label>
            </div>
            <Button className="w-full" size="lg">
              직원 계정 만들기
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
