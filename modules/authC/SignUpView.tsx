// src/modules/auth/SignUpView.tsx
"use client";

import Link from "next/link";
import { Store } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { useSignUp } from "./useSignUp";

export default function SignUpView() {
  const { form, updateField, submit, loading, fieldErrors } = useSignUp();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">회원가입</h1>
          <p className="text-muted-foreground">서비스 이용을 위해 정보를 입력해주세요</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <CardTitle>사장님 계정 생성</CardTitle>
            </div>
            <CardDescription>사업자 정보와 계정 정보를 입력합니다</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-4">
              {/* 계정 정보 (Owner) */}
              <div className="space-y-2">
                <Label>이름 (실명)</Label>
                <Input 
                  value={form.username} 
                  onChange={(e) => updateField("username", e.target.value)} 
                  className={fieldErrors.username ? "border-red-500" : ""}
                />
                {fieldErrors.username && <p className="text-xs text-red-500">{fieldErrors.username}</p>}
              </div>

              <div className="space-y-2">
                <Label>이메일 (아이디)</Label>
                <Input 
                  type="email" 
                  value={form.email} 
                  onChange={(e) => updateField("email", e.target.value)}
                  className={fieldErrors.email ? "border-red-500" : ""}
                />
                {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label>비밀번호</Label>
                <Input 
                  type="password" 
                  value={form.password} 
                  onChange={(e) => updateField("password", e.target.value)}
                  className={fieldErrors.password ? "border-red-500" : ""}
                />
                {fieldErrors.password && <p className="text-xs text-red-500">{fieldErrors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label>비밀번호 확인</Label>
                <Input 
                  type="password" 
                  value={form.confirmPassword} 
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  className={fieldErrors.confirmPassword ? "border-red-500" : ""}
                />
                {fieldErrors.confirmPassword && <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>}
              </div>

              <div className="h-px bg-slate-200 my-4" />

              {/* 사업자 정보 (BusinessNumber, Store) */}
              <div className="space-y-2">
                <Label>상호명</Label>
                <Input 
                  value={form.storeName} 
                  onChange={(e) => updateField("storeName", e.target.value)}
                  className={fieldErrors.storeName ? "border-red-500" : ""}
                />
                {fieldErrors.storeName && <p className="text-xs text-red-500">{fieldErrors.storeName}</p>}
              </div>

              <div className="space-y-2">
                <Label>사업자 등록 번호</Label>
                <Input 
                  value={form.businessNumber} 
                  onChange={(e) => updateField("businessNumber", e.target.value)}
                  placeholder="000-00-00000"
                  className={fieldErrors.businessNumber ? "border-red-500" : ""}
                />
                {fieldErrors.businessNumber && <p className="text-xs text-red-500">{fieldErrors.businessNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label>대표 연락처</Label>
                <Input 
                  value={form.phone} 
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="010-0000-0000"
                  className={fieldErrors.phone ? "border-red-500" : ""}
                />
                {fieldErrors.phone && <p className="text-xs text-red-500">{fieldErrors.phone}</p>}
              </div>

              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? "가입 처리 중..." : "회원가입 완료"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center text-sm text-muted-foreground">
            이미 계정이 있으신가요? <Link href="/login" className="text-primary hover:underline ml-1">로그인</Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}