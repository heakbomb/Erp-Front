"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Store, Users, Shield } from "lucide-react"
import { Cookie as Google } from "lucide-react"

export default function LoginPage() {
  const [ownerEmail, setOwnerEmail] = useState("")
  const [ownerPassword, setOwnerPassword] = useState("")
  const [adminUsername, setAdminUsername] = useState("")
  const [adminPassword, setAdminPassword] = useState("")

  const handleOwnerLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement owner login logic
    console.log("Owner login:", { ownerEmail, ownerPassword })
  }

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement social login logic
    console.log(`Employee social login with ${provider}`)
  }

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement admin login logic
    console.log("Admin login:", { adminUsername, adminPassword })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">요식업 ERP</h1>
          <p className="text-muted-foreground">통합 관리 시스템</p>
        </div>

        <Tabs defaultValue="owner" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="owner" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              사장님
            </TabsTrigger>
            <TabsTrigger value="employee" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              직원
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              관리자
            </TabsTrigger>
          </TabsList>

          <TabsContent value="owner">
            <Card>
              <CardHeader>
                <CardTitle>사장님 로그인</CardTitle>
                <CardDescription>사업장을 관리하고 직원을 등록하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleOwnerLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="owner-email">이메일</Label>
                    <Input
                      id="owner-email"
                      type="email"
                      placeholder="example@email.com"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner-password">비밀번호</Label>
                    <Input
                      id="owner-password"
                      type="password"
                      placeholder="••••••••"
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    로그인
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
                  비밀번호를 잊으셨나요?
                </Link>
                <div className="text-sm text-muted-foreground">
                  계정이 없으신가요?{" "}
                  <Link href="/register" className="text-primary hover:underline">
                    회원가입
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="employee">
            <Card>
              <CardHeader>
                <CardTitle>직원 로그인</CardTitle>
                <CardDescription>소셜 계정으로 간편하게 로그인하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full bg-transparent" onClick={() => handleSocialLogin("google")}>
                  <Google className="mr-2 h-5 w-5" />
                  Google로 로그인
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#000000] border-[#FEE500]"
                  onClick={() => handleSocialLogin("kakao")}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.8 6.7-.2.8-.7 2.8-.8 3.2 0 .2 0 .3.2.4.1.1.3.1.4 0 .5-.3 3.7-2.4 4.3-2.8.4 0 .8.1 1.1.1 5.5 0 10-3.6 10-8S17.5 3 12 3z" />
                  </svg>
                  카카오로 로그인
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-[#03C75A] hover:bg-[#03C75A]/90 text-white border-[#03C75A]"
                  onClick={() => handleSocialLogin("naver")}
                >
                  <span className="mr-2 font-bold text-lg">N</span>
                  네이버로 로그인
                </Button>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground text-center w-full">직원 계정은 소셜 로그인만 지원합니다</p>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>관리자 로그인</CardTitle>
                <CardDescription>시스템 관리자 전용</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-username">아이디</Label>
                    <Input
                      id="admin-username"
                      type="text"
                      placeholder="관리자 아이디"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">비밀번호</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    로그인
                  </Button>
                </form>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground text-center w-full">
                  관리자 계정은 시스템 관리자에게 문의하세요
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
