"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Store } from "lucide-react"

export default function RegisterPage() {
  const [ownerData, setOwnerData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessNumber: "",
    phone: "",
  })

  const handleOwnerRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (ownerData.password !== ownerData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다")
      return
    }
    // TODO: Implement owner registration logic
    console.log("Owner registration:", ownerData)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">요식업 ERP</h1>
          <p className="text-muted-foreground">새로운 계정 만들기</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Store className="h-5 w-5 text-primary" />
              <CardTitle>사장님 회원가입</CardTitle>
            </div>
            <CardDescription>사업장을 등록하고 관리를 시작하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOwnerRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="owner-name">이름</Label>
                <Input
                  id="owner-name"
                  type="text"
                  placeholder="홍길동"
                  value={ownerData.name}
                  onChange={(e) => setOwnerData({ ...ownerData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-email">이메일</Label>
                <Input
                  id="owner-email"
                  type="email"
                  placeholder="example@email.com"
                  value={ownerData.email}
                  onChange={(e) => setOwnerData({ ...ownerData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-phone">전화번호</Label>
                <Input
                  id="owner-phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  value={ownerData.phone}
                  onChange={(e) => setOwnerData({ ...ownerData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-name">사업장명</Label>
                <Input
                  id="business-name"
                  type="text"
                  placeholder="홍길동 식당"
                  value={ownerData.businessName}
                  onChange={(e) => setOwnerData({ ...ownerData, businessName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-number">사업자등록번호</Label>
                <Input
                  id="business-number"
                  type="text"
                  placeholder="123-45-67890"
                  value={ownerData.businessNumber}
                  onChange={(e) => setOwnerData({ ...ownerData, businessNumber: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-password">비밀번호</Label>
                <Input
                  id="owner-password"
                  type="password"
                  placeholder="••••••••"
                  value={ownerData.password}
                  onChange={(e) => setOwnerData({ ...ownerData, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-confirm-password">비밀번호 확인</Label>
                <Input
                  id="owner-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={ownerData.confirmPassword}
                  onChange={(e) => setOwnerData({ ...ownerData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                회원가입
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <div className="text-sm text-muted-foreground w-full text-center">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="text-primary hover:underline">
                로그인
              </Link>
            </div>
            <div className="text-xs text-muted-foreground w-full text-center pt-2 border-t">
              직원 계정은 소셜 로그인 후 사업장 코드로 신청하세요
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
