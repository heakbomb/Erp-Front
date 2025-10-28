"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, User, Shield } from "lucide-react"

export function LoginForm() {
  const [userType, setUserType] = useState<"owner" | "employee" | "admin">("owner")

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">요식업 ERP 시스템</CardTitle>
        <CardDescription>계정 유형을 선택하고 로그인하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={userType} onValueChange={(v) => setUserType(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="owner" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">사장</span>
            </TabsTrigger>
            <TabsTrigger value="employee" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">직원</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">관리자</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="owner" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="owner-username">아이디</Label>
              <Input id="owner-username" placeholder="아이디를 입력하세요" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner-password">비밀번호</Label>
              <Input id="owner-password" type="password" placeholder="비밀번호를 입력하세요" />
            </div>
            <Button className="w-full" size="lg">
              사장 로그인
            </Button>
          </TabsContent>

          <TabsContent value="employee" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee-email">이메일</Label>
              <Input id="employee-email" type="email" placeholder="이메일을 입력하세요" />
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">또는 소셜 로그인</p>
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
            <Button className="w-full" size="lg">
              직원 로그인
            </Button>
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-username">관리자 아이디</Label>
              <Input id="admin-username" placeholder="관리자 아이디를 입력하세요" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">비밀번호</Label>
              <Input id="admin-password" type="password" placeholder="비밀번호를 입력하세요" />
            </div>
            <Button className="w-full" size="lg" variant="destructive">
              관리자 로그인
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center text-muted-foreground">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            회원가입
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
