"use client"

import Link from "next/link"
import { Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import useSignUp from "../hooks/useSignUp"

export default function SignUpView() {
  const { form, updateField, submit, loading, error, successMessage } = useSignUp()

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
            {error && <p className="text-sm text-red-600">{error}</p>}
            {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                submit()
              }}
              className="space-y-4"
            >
              {/* 이름 */}
              <div className="space-y-2">
                <Label htmlFor="owner-name">이름</Label>
                <Input
                  id="owner-name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                />
              </div>

              {/* 이메일 */}
              <div className="space-y-2">
                <Label htmlFor="owner-email">이메일</Label>
                <Input
                  id="owner-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                />
              </div>

              {/* 전화번호 */}
              <div className="space-y-2">
                <Label htmlFor="owner-phone">전화번호</Label>
                <Input
                  id="owner-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  required
                />
              </div>

              {/* 사업장명 */}
              <div className="space-y-2">
                <Label htmlFor="business-name">사업장명</Label>
                <Input
                  id="business-name"
                  value={form.businessName}
                  onChange={(e) => updateField("businessName", e.target.value)}
                  required
                />
              </div>

              {/* 사업자번호 */}
              <div className="space-y-2">
                <Label htmlFor="business-number">사업자등록번호</Label>
                <Input
                  id="business-number"
                  value={form.businessNumber}
                  onChange={(e) => updateField("businessNumber", e.target.value)}
                  required
                />
              </div>

              {/* 비밀번호 */}
              <div className="space-y-2">
                <Label htmlFor="owner-password">비밀번호</Label>
                <Input
                  id="owner-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                />
              </div>

              {/* 비밀번호 확인 */}
              <div className="space-y-2">
                <Label htmlFor="owner-confirm-password">비밀번호 확인</Label>
                <Input
                  id="owner-confirm-password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "회원가입 중..." : "회원가입"}
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