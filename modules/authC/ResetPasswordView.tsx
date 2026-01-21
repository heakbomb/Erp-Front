// src/modules/auth/ResetPasswordView.tsx
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useResetPassword } from "./useResetPassword";

export default function ResetPasswordView() {
  const { newPassword, confirmPassword, isLoading, setNewPassword, setConfirmPassword, handleSubmit } =
    useResetPassword();

  return (
    <div className="mx-auto flex min-h-dvh max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>비밀번호 재설정</CardTitle>
          <CardDescription>새 비밀번호를 입력하고 저장하세요.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "저장 중..." : "저장"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-xs text-muted-foreground">
          링크가 만료되면 비밀번호 재설정을 다시 요청해야 합니다.
        </CardFooter>
      </Card>
    </div>
  );
}