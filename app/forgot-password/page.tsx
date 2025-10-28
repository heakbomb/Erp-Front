"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement password reset logic
    console.log("Password reset for:", email)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">요식업 ERP</h1>
          <p className="text-muted-foreground">비밀번호 재설정</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>비밀번호를 잊으셨나요?</CardTitle>
            <CardDescription>
              {submitted
                ? "이메일을 확인해주세요"
                : "가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {email}로 비밀번호 재설정 링크를 보냈습니다.
                  <br />
                  이메일을 확인해주세요.
                </p>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    로그인으로 돌아가기
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  재설정 링크 보내기
                </Button>
              </form>
            )}
          </CardContent>
          {!submitted && (
            <CardFooter>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  로그인으로 돌아가기
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
