"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { useForgotPassword } from "./useForgotPassword";

export default function ForgotPasswordView() {
  const reduceMotion = useReducedMotion();
  const { email, submitted, isLoading, setEmail, handleSubmit } = useForgotPassword();

  const fadeUp = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-dvh bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,theme(colors.muted)_0,transparent_60%)] opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,theme(colors.background))]" />
      </div>

      <div className="mx-auto grid min-h-dvh max-w-4xl items-center gap-6 px-4 py-10 md:grid-cols-12">
        {/* Left help panel */}
        <motion.aside
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="md:col-span-6"
        >
          <div className="rounded-2xl border bg-muted/30 p-6 md:p-8">
            <h1 className="text-2xl font-bold md:text-3xl">비밀번호 재설정</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              가입 시 사용한 이메일로 재설정 링크를 보냅니다. 메일함(스팸함 포함)을 확인하세요.
            </p>

            <div className="mt-6 grid gap-3">
              <Tip icon={<Mail className="h-4 w-4" />} title="이메일 입력" desc="가입한 이메일을 정확히 입력" />
              <Tip icon={<CheckCircle2 className="h-4 w-4" />} title="메일 확인" desc="스팸함도 함께 확인" />
            </div>

            <div className="mt-6">
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  로그인으로 돌아가기
                </Link>
              </Button>
            </div>
          </div>
        </motion.aside>

        {/* Form */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.45, delay: 0.05, ease: "easeOut" }}
          className="md:col-span-6"
        >
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>재설정 링크 요청</CardTitle>
              <CardDescription>{submitted ? "이메일 전송 완료" : "가입 시 사용한 이메일을 입력하세요."}</CardDescription>
            </CardHeader>

            <CardContent>
              {submitted ? (
                <div className="rounded-xl border bg-muted/20 p-4 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">{email}</span> 로 재설정 링크가 전송되었습니다.
                    <br />
                    메일함을 확인해주세요.
                  </p>
                  <div className="mt-4 text-xs text-muted-foreground">
                    메일이 오지 않으면 스팸함 확인 후 다시 시도하세요.
                  </div>
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

                  <p className="text-[11px] text-muted-foreground">
                    보안상 이메일 존재 여부는 안내 메시지가 동일할 수 있습니다.
                  </p>
                </form>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-2 border-t bg-muted/10 py-5">
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  로그인으로 돌아가기
                </Link>
              </Button>
              <div className="w-full text-center text-xs text-muted-foreground">
                계정이 없다면 <Link href="/sign-up" className="text-primary hover:underline">회원가입</Link>
              </div>
            </CardFooter>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}

function Tip({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
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