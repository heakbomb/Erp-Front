"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Store, Users, Shield, QrCode, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { useLogin } from "./useLogin";
import EmployeesQr from "@/modules/employeeC/EmployeesQr";

export default function LoginView() {
  const reduceMotion = useReducedMotion();

  const {
    ownerEmail,
    setOwnerEmail,
    ownerPassword,
    setOwnerPassword,
    adminUsername,
    setAdminUsername,
    adminPassword,
    setAdminPassword,
    isLoading,
    handleOwnerLogin,
    handleSocialLogin,
    handleAdminLogin,
  } = useLogin();

  const fadeUp = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-dvh bg-background">
      {/* subtle background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,theme(colors.muted)_0,transparent_60%)] opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,theme(colors.background))]" />
      </div>

      <div className="mx-auto grid min-h-dvh max-w-6xl items-stretch gap-6 px-4 py-8 md:grid-cols-12 md:py-12">
        {/* LEFT: Brand / Value */}
        <motion.aside
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="md:col-span-6 lg:col-span-7"
        >
          <div className="flex h-full flex-col justify-between rounded-2xl border bg-muted/30 p-6 md:p-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-background">
                  <Store className="h-4 w-4" />
                </span>
                <div className="font-semibold tracking-tight">요식업 ERP</div>
                <span className="ml-1 rounded-full border bg-background px-2 py-0.5 text-xs text-muted-foreground">
                  beta
                </span>
              </div>

              <h1 className="mt-6 text-3xl font-bold leading-tight md:text-4xl">
                운영 흐름에 맞춘
                <span className="block">올인원 요식업 ERP</span>
              </h1>
              <p className="mt-3 max-w-lg text-sm text-muted-foreground md:text-base">
                근태/급여 · 발주/재고 · 매출 분석 · AI 리포트까지. 필요한 기능을 한 화면에서 자연스럽게 연결합니다.
              </p>

              {/* highlights */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Highlight icon={<CheckCircle2 className="h-4 w-4" />} title="요식업 운영 흐름" desc="근태→급여→발주→재고→매출" />
                <Highlight icon={<Lock className="h-4 w-4" />} title="권한/보안 기본값" desc="사장/직원/관리자 RBAC" />
                <Highlight icon={<Sparkles className="h-4 w-4" />} title="UX 중심 화면" desc="실무형 카드/탭 구조" />
                <Highlight icon={<Users className="h-4 w-4" />} title="팀 협업 최적화" desc="매장 단위 데이터 분리" />
              </div>
            </div>

            {/* optional image (없으면 자동으로 안 깨짐) */}
            <div className="mt-6 hidden md:block">
              <div className="relative overflow-hidden rounded-2xl border bg-background">
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.08),transparent_55%)]" />
                <Image
                  src="/Maindashboard.png"
                  alt="대시보드 미리보기"
                  width={1200}
                  height={720}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                * 예시 화면. 실제 기능 구현 상황에 따라 구성은 달라질 수 있습니다.
              </p>
            </div>
          </div>
        </motion.aside>

        {/* RIGHT: Auth Card */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.45, delay: 0.05, ease: "easeOut" }}
          className="md:col-span-6 lg:col-span-5"
        >
          <Card className="h-full rounded-2xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl">로그인</CardTitle>
              <CardDescription>역할에 맞는 방식으로 접속하세요.</CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="owner" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="owner" className="gap-2">
                    <Store className="h-4 w-4" />
                    사장
                  </TabsTrigger>
                  <TabsTrigger value="employee" className="gap-2">
                    <Users className="h-4 w-4" />
                    직원
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="gap-2">
                    <Shield className="h-4 w-4" />
                    관리자
                  </TabsTrigger>
                  <TabsTrigger value="attendanceQr" className="gap-2">
                    <QrCode className="h-4 w-4" />
                    QR
                  </TabsTrigger>
                </TabsList>

                {/* Owner */}
                <TabsContent value="owner" className="mt-6">
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="mb-3">
                      <p className="text-sm font-semibold">사장님 로그인</p>
                      <p className="text-xs text-muted-foreground">이메일/비밀번호로 로그인</p>
                    </div>

                    <form onSubmit={handleOwnerLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">이메일</Label>
                        <Input
                          id="email"
                          type="email"
                          value={ownerEmail}
                          onChange={(e) => setOwnerEmail(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">비밀번호</Label>
                        <Input
                          id="password"
                          type="password"
                          value={ownerPassword}
                          onChange={(e) => setOwnerPassword(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "로그인 중..." : "로그인"}
                      </Button>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <Link href="/forgot-password" className="hover:underline">
                          비밀번호 찾기
                        </Link>
                        <Link href="/sign-up" className="text-primary hover:underline">
                          사장 회원가입
                        </Link>
                      </div>
                    </form>
                  </div>
                </TabsContent>

                {/* Employee (Social) */}
                <TabsContent value="employee" className="mt-6">
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="mb-3">
                      <p className="text-sm font-semibold">직원 로그인</p>
                      <p className="text-xs text-muted-foreground">소셜 계정으로 간편 로그인</p>
                    </div>

                    <div className="space-y-3">
                      {/* ✅ Google Primary */}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start gap-3 bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 active:bg-slate-100"
                        onClick={() => handleSocialLogin("google")}
                        disabled={isLoading}
                        aria-label="Google 계정으로 로그인"
                      >
                        <span className="inline-flex h-5 w-5 items-center justify-center">
                          {/* Google 'G' (SVG) */}
                          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                            <path
                              fill="#EA4335"
                              d="M24 9.5c3.54 0 6.72 1.22 9.22 3.62l6.9-6.9C35.95 2.38 30.4 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.04 6.24C12.54 13.1 17.84 9.5 24 9.5z"
                            />
                            <path
                              fill="#4285F4"
                              d="M46.15 24.5c0-1.64-.15-3.21-.43-4.73H24v9.02h12.42c-.54 2.9-2.18 5.36-4.64 7.01l7.11 5.52c4.16-3.84 6.26-9.5 6.26-16.82z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M10.6 28.54A14.5 14.5 0 0 1 9.5 24c0-1.58.28-3.1.78-4.54l-8.04-6.24A23.92 23.92 0 0 0 0 24c0 3.86.92 7.5 2.56 10.78l8.04-6.24z"
                            />
                            <path
                              fill="#34A853"
                              d="M24 48c6.4 0 11.95-2.11 15.92-5.71l-7.11-5.52c-1.98 1.33-4.53 2.11-8.81 2.11-6.16 0-11.46-3.6-13.4-8.96l-8.04 6.24C6.51 42.62 14.62 48 24 48z"
                            />
                          </svg>
                        </span>

                        <span className="flex-1 text-left text-sm font-medium">
                          Google로 계속하기
                        </span>
                      </Button>

                      {/* ✅ Kakao Secondary (기능 유지) */}
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 bg-[#FEE500] text-black hover:bg-[#FEE500]/90 border-none"
                        onClick={() => handleSocialLogin("kakao")}
                        disabled={isLoading}
                      >
                        카카오로 로그인
                      </Button>

                      {/* ✅ 네이버 로그인 삭제 */}

                      <div className="mt-4 rounded-xl border bg-background p-3 text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">안내</p>
                        <p className="mt-1">최초 로그인 후, 사장님이 직원승인 하면 매장 기능이 활성화됩니다.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Admin */}
                <TabsContent value="admin" className="mt-6">
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="mb-3">
                      <p className="text-sm font-semibold">관리자 로그인</p>
                      <p className="text-xs text-muted-foreground">시스템 관리자 전용</p>
                    </div>

                    <form onSubmit={handleAdminLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label>아이디</Label>
                        <Input value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} placeholder="admin" />
                      </div>
                      <div className="space-y-2">
                        <Label>비밀번호</Label>
                        <Input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="••••••••" />
                      </div>

                      <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-900/90">
                        관리자 접속
                      </Button>
                    </form>
                  </div>
                </TabsContent>

                {/* QR */}
                <TabsContent value="attendanceQr" className="mt-6">
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="mb-3">
                      <p className="text-sm font-semibold">출결 QR</p>
                      <p className="text-xs text-muted-foreground">직원 출퇴근용 사업장 QR 값 발급·조회</p>
                    </div>
                    <EmployeesQr />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 border-t bg-muted/10 py-5">
              <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                <span>서비스 소개가 필요하신가요?</span>
                <Link href="/" className="text-primary hover:underline">
                  소개페이지로 이동
                </Link>
              </div>
              <div className="w-full text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground">Tip:</span> 직원 로그인은 소셜 기반, 사장 계정은 회원가입 후 이용합니다.
              </div>
            </CardFooter>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}

function Highlight({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border bg-background p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl border bg-muted/40">
          {icon}
        </span>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
    </div>
  );
}