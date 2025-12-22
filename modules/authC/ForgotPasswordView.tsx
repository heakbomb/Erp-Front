// src/modules/auth/ForgotPasswordView.tsx
"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForgotPassword } from "./useForgotPassword";

export default function ForgotPasswordView() {
  const { email, submitted, isLoading, setEmail, handleSubmit } = useForgotPassword();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>비밀번호 재설정</CardTitle>
            <CardDescription>
              {submitted
                ? "이메일 전송 완료"
                : "가입 시 사용한 이메일을 입력하세요."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  <strong>{email}</strong>로 재설정 링크가 전송되었습니다.<br />
                  메일함을 확인해주세요.
                </p>
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
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  재설정 링크 보내기
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" /> 로그인으로 돌아가기
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}