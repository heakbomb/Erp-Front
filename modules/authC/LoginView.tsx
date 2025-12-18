// modules/authC/LoginView.tsx
"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Store, Users, Shield, Cookie as Google, QrCode } from "lucide-react";
import { useLogin } from "./useLogin";

// ✅ 복구된 컴포넌트 import
import EmployeesQr from "@/modules/employeeC/EmployeesQr";

export default function LoginView() {
  const {
    ownerEmail, setOwnerEmail,
    ownerPassword, setOwnerPassword,
    adminUsername, setAdminUsername,
    adminPassword, setAdminPassword,
    // storeCode, setStoreCode, // ❌ 키오스크 폼 제거로 인해 미사용
    isLoading,
    // fieldErrors, // ❌ 에러 처리가 아래 코드에 명시적으로 없으면 생략 가능하나 유지해도 무방
    handleOwnerLogin,
    handleSocialLogin,
    handleAdminLogin,
    // handleEnterKiosk, // ❌ 제거
  } = useLogin();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-primary mb-2 tracking-tight">요식업 ERP</h1>
          <p className="text-muted-foreground">스마트한 매장 관리의 시작</p>
        </div>

        <Tabs defaultValue="owner" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="owner" className="gap-2"><Store className="h-4 w-4"/>사장님</TabsTrigger>
            <TabsTrigger value="employee" className="gap-2"><Users className="h-4 w-4"/>직원</TabsTrigger>
            <TabsTrigger value="admin" className="gap-2"><Shield className="h-4 w-4"/>관리자</TabsTrigger>
            <TabsTrigger value="attendanceQr" className="gap-2"><QrCode className="h-4 w-4"/>QR</TabsTrigger>
          </TabsList>

          {/* 사장님 로그인 */}
          <TabsContent value="owner">
            <Card>
              <CardHeader>
                <CardTitle>사장님 로그인</CardTitle>
                <CardDescription>등록된 이메일로 로그인하세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleOwnerLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input id="email" type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} disabled={isLoading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">비밀번호</Label>
                    <Input id="password" type="password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} disabled={isLoading} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "로그인 중..." : "로그인"}</Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-muted-foreground">
                <Link href="/forgot-password">비밀번호 찾기</Link>
                <Link href="/sign-up" className="text-primary hover:underline">회원가입</Link>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* 직원 로그인 (소셜 전용) */}
          <TabsContent value="employee">
            <Card>
              <CardHeader>
                <CardTitle>직원 로그인</CardTitle>
                <CardDescription>소셜 계정으로 빠르고 간편하게 시작하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full relative" onClick={() => handleSocialLogin("google")}>
                   <Google className="mr-2 h-4 w-4" /> Google로 계속하기
                </Button>
                <Button variant="outline" className="w-full bg-[#FEE500] hover:bg-[#FEE500]/90 text-black border-none" onClick={() => handleSocialLogin("kakao")}>
                   카카오로 계속하기
                </Button>
                <Button variant="outline" className="w-full bg-[#03C75A] hover:bg-[#03C75A]/90 text-white border-none" onClick={() => handleSocialLogin("naver")}>
                   네이버로 계속하기
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 관리자 로그인 */}
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>관리자 로그인</CardTitle>
                <CardDescription>시스템 관리자 전용 페이지입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label>아이디</Label>
                    <Input value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>비밀번호</Label>
                    <Input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full bg-slate-800">관리자 접속</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ✅ [복구] QR 탭: 키오스크 진입 대신 QR 생성/조회 기능으로 변경 */}
          <TabsContent value="attendanceQr">
            <Card>
              <CardHeader>
                <CardTitle>출결 QR</CardTitle>
                <CardDescription>
                  직원 출퇴근용 사업장 QR 값을 발급·조회합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmployeesQr />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}