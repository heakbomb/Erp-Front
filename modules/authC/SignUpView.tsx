"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Mail,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Store,
  Lock,
  User,
  RotateCcw,
  Clock,
} from "lucide-react";

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

import { useSignUp } from "./useSignUp";
import { authApi } from "./authApi";

type Step = 0 | 1 | 2 | 3 | 4;

const EMAIL_CODE_TTL_SEC = 180; // 3:00
const AUTO_VERIFY_DEBOUNCE_MS = 300; // (사용 안해도 유지)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function SignUpView() {
  const reduceMotion = useReducedMotion();
  const { form, updateField, submit, loading, fieldErrors, setFieldError } = useSignUp();

  const [step, setStep] = useState<Step>(0);

  // email verify UI state
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // backend verification id
  const [verificationId, setVerificationId] = useState<string | null>(null);

  // code error message
  const [codeError, setCodeError] = useState<string>("");

  // ✅ 이메일 중복 조회 중
  const [checkingEmail, setCheckingEmail] = useState(false);

  // timer state
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remainingSec, setRemainingSec] = useState<number>(0);
  const isExpired = expiresAt !== null && remainingSec <= 0;

  // refs
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const codeRef = useRef<HTMLInputElement | null>(null);
  const pwRef = useRef<HTMLInputElement | null>(null);
  const pw2Ref = useRef<HTMLInputElement | null>(null);

  // debounce ref (유지)
  const autoVerifyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navLockRef = useRef(false);
  const lockNav = () => {
    navLockRef.current = true;
    requestAnimationFrame(() => {
      navLockRef.current = false;
    });
  };

  const steps = useMemo(
    () => [
      { key: "name", label: "이름" },
      { key: "email", label: "이메일" },
      { key: "verify", label: "인증" },
      { key: "password", label: "비밀번호" },
      { key: "confirm", label: "확인" },
    ],
    []
  );

  const isEmailValid = (email: string) => EMAIL_REGEX.test(email.trim());

  const canGoNext = (s: Step) => {
    if (s === 0) return Boolean(form.username?.trim()) && !fieldErrors.username;

    if (s === 1) {
      const email = form.email ?? "";
      return Boolean(email.trim()) && isEmailValid(email) && !fieldErrors.email && !checkingEmail;
    }

    if (s === 2) return isEmailVerified;

    // ✅ 요청사항: 8자 이상일 때만 다음 버튼 활성화
    if (s === 3) return (form.password ?? "").length >= 8 && !fieldErrors.password;

    if (s === 4) return Boolean(form.confirmPassword?.trim()) && !fieldErrors.confirmPassword;

    return false;
  };

  const prev = () => {
    if (navLockRef.current) return;
    lockNav();
    setStep((p) => (Math.max(p - 1, 0) as Step));
  };

  // ---------- Timer ----------
  useEffect(() => {
    if (!expiresAt) {
      setRemainingSec(0);
      return;
    }

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setRemainingSec(diff);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const formatMMSS = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ---------- Focus ----------
  useEffect(() => {
    const t = setTimeout(() => {
      if (step === 0) nameRef.current?.focus();
      if (step === 1) emailRef.current?.focus();
      if (step === 2) codeRef.current?.focus();
      if (step === 3) pwRef.current?.focus();
      if (step === 4) pw2Ref.current?.focus();
    }, 30);
    return () => clearTimeout(t);
  }, [step]);

  // ---------- Verify helpers ----------
  const resetVerifyState = () => {
    setIsEmailSent(false);
    setIsEmailVerified(false);
    setVerificationCode("");
    setVerificationId(null);
    setCodeError("");
    setExpiresAt(null);
  };

  const handleSendEmail = async () => {
    if (!form.email?.trim() || !isEmailValid(form.email) || fieldErrors.email) return;

    try {
      setCodeError("");

      const res = await authApi.sendEmailVerificationCode({ email: form.email.trim() });

      setVerificationId(res.verificationId);
      setIsEmailSent(true);
      setIsEmailVerified(false);
      setVerificationCode("");
      setExpiresAt(Date.now() + EMAIL_CODE_TTL_SEC * 1000);
    } catch (e: any) {
      setIsEmailSent(false);
      setIsEmailVerified(false);
      setVerificationId(null);
      setExpiresAt(null);
      setCodeError(e?.friendlyMessage || "인증 메일 전송에 실패했습니다.");
    }
  };

  const handleResendEmail = async () => {
    if (!verificationId) {
      await handleSendEmail();
      return;
    }

    try {
      setCodeError("");
      await authApi.resendEmailVerificationCode(verificationId);

      setIsEmailSent(true);
      setIsEmailVerified(false);
      setVerificationCode("");
      setExpiresAt(Date.now() + EMAIL_CODE_TTL_SEC * 1000);
    } catch (e: any) {
      setCodeError(e?.friendlyMessage || "인증 메일 재전송에 실패했습니다.");
    }
  };

  const handleVerifyCode = async () => {
    if (!isEmailSent || isExpired) return;

    const code = verificationCode.trim();
    if (!code) return;

    if (!verificationId) {
      setCodeError("인증 요청 정보가 없습니다. 재전송 후 다시 시도하세요.");
      return;
    }

    try {
      setCodeError("");
      const res = await authApi.confirmEmailVerificationCode({ verificationId, code });

      if (res.verified) {
        setIsEmailVerified(true);
        setCodeError("");
      } else {
        setIsEmailVerified(false);
        setCodeError("인증 코드가 올바르지 않습니다.");
      }
    } catch (e: any) {
      setIsEmailVerified(false);
      setCodeError(e?.friendlyMessage || "인증에 실패했습니다. 재전송 후 다시 시도하세요.");
    }
  };

  // 이메일 바뀌면 인증정보 초기화
  useEffect(() => {
    resetVerifyState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.email]);

  // ✅ STEP1에서 “다음” 누를 때 이메일 중복 조회 후 진행
  const next = async () => {
    if (navLockRef.current) return;
    if (!canGoNext(step)) return;

    if (step === 1) {
      const email = (form.email ?? "").trim().toLowerCase();

      try {
        setCheckingEmail(true);
        const { exists } = await authApi.checkOwnerEmailExists(email);

        if (exists) {
          alert("이미 가입된 이메일입니다.");
          setFieldError("email", "이미 가입된 이메일입니다.");
          return;
        }
      } catch (e: any) {
        const msg =
          e?.friendlyMessage ||
          "이메일 확인 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.";
        alert(msg);
        setFieldError("email", msg);
        return;
      } finally {
        setCheckingEmail(false);
      }
    }

    lockNav();
    setStep((p) => (Math.min(p + 1, 4) as Step));
  };

  const handleFinalSubmit = async () => {
    if (!isEmailVerified) return;
    await submit(verificationId);
  };

  // ---------- Enter behavior ----------
  const onEnter = async (e: React.KeyboardEvent) => {
    if ((e.nativeEvent as any).isComposing) return;
    if (e.key !== "Enter") return;

    e.preventDefault();
    if (navLockRef.current) return;

    if (step === 2) {
      handleVerifyCode();
      return;
    }

    if (step === 4) {
      if (canGoNext(4) && isEmailVerified) handleFinalSubmit();
      return;
    }

    await next();
  };

  const fadeUp = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduceMotion ? 0 : -10 },
  };

  const emailHint =
    form.email?.trim().length === 0
      ? "이메일을 입력하세요."
      : isEmailValid(form.email)
        ? "올바른 이메일 형식입니다."
        : "이메일 형식이 올바르지 않습니다.";

  return (
    <div className="min-h-dvh bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,theme(colors.muted)_0,transparent_60%)] opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,theme(colors.background))]" />
      </div>

      <div className="mx-auto grid min-h-dvh max-w-5xl items-stretch gap-6 px-4 py-10 md:grid-cols-12">
        {/* LEFT */}
        <aside className="md:col-span-5">
          <div className="flex h-full flex-col justify-between rounded-2xl border bg-muted/30 p-6 md:p-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-background">
                  <Store className="h-4 w-4" />
                </span>
                <div className="font-semibold tracking-tight">사장님 계정 생성</div>
              </div>

              <h1 className="mt-6 text-3xl font-bold leading-tight">회원가입</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Enter 또는 “다음” 버튼으로 진행합니다.
              </p>

              <div className="mt-6 rounded-2xl border bg-background p-4">
                <p className="text-xs text-muted-foreground">진행 단계</p>

                <div className="mt-4 flex items-start justify-between gap-2">
                  {steps.map((s, idx) => {
                    const current = idx === step;
                    const done = idx < step;

                    return (
                      <div key={s.key} className="flex flex-1 flex-col items-center gap-2">
                        <div className="flex w-full items-center">
                          <div className="w-full flex justify-center">
                            <div
                              className={[
                                "inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition",
                                done
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background text-muted-foreground",
                                current ? "ring-2 ring-primary/30" : "",
                              ].join(" ")}
                              aria-current={current ? "step" : undefined}
                            >
                              {done ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                            </div>
                          </div>

                          {idx < steps.length - 1 && (
                            <div
                              className={[
                                "absolute left-1/2 top-[18px] -z-10 h-px w-[calc(100%-36px)] translate-x-[18px]",
                                done ? "bg-primary" : "bg-border",
                              ].join(" ")}
                            />
                          )}
                        </div>

                        <div className="text-center leading-tight">
                          <p
                            className={[
                              "text-xs font-medium",
                              current || done ? "text-foreground" : "text-muted-foreground",
                            ].join(" ")}
                          >
                            {s.label}
                          </p>
                          <p
                            className={[
                              "mt-0.5 text-[11px]",
                              done
                                ? "text-green-600"
                                : current
                                  ? "text-primary"
                                  : "text-muted-foreground",
                            ].join(" ")}
                          >
                            {done ? "완료" : current ? "진행중" : "대기"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-4 text-sm font-medium">
                  현재: <span className="text-primary">{steps[step]?.label}</span>
                </p>
              </div>

              <div className="mt-6 grid gap-3">
                <MiniInfo icon={<User className="h-4 w-4" />} title="필수 정보만" desc="이름/이메일/비밀번호" />
                <MiniInfo icon={<Mail className="h-4 w-4" />} title="이메일 인증" desc="코드 확인으로 계정 보호" />
                <MiniInfo icon={<Lock className="h-4 w-4" />} title="보안 기본값" desc="권한/접근제어 기반" />
              </div>
            </div>

            <div className="mt-6 text-xs text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="text-primary hover:underline">
                로그인
              </Link>
            </div>
          </div>
        </aside>

        {/* RIGHT */}
        <section className="md:col-span-7">
          <Card className="h-full rounded-2xl">
            <CardHeader>
              <CardTitle>사장님 계정 생성</CardTitle>
              <CardDescription>필수 정보만 입력하면 가입이 완료됩니다.</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="rounded-2xl border bg-muted/20 p-5 md:p-6">
                <AnimatePresence mode="wait">
                  {/* STEP 0 */}
                  {step === 0 && (
                    <motion.div
                      key="step-name"
                      variants={fadeUp}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <User className="h-4 w-4" />
                        이름 입력
                      </div>

                      <div className="space-y-2">
                        <Label>이름 (실명)</Label>
                        <Input
                          ref={nameRef}
                          value={form.username}
                          onChange={(e) => updateField("username", e.target.value)}
                          onKeyDown={onEnter}
                          className={fieldErrors.username ? "border-red-500" : ""}
                          placeholder="홍길동"
                          disabled={loading}
                        />
                        {fieldErrors.username && <p className="text-xs text-red-500">{fieldErrors.username}</p>}
                      </div>

                      <div className="flex justify-end">
                        <Button type="button" onClick={next} disabled={!canGoNext(0)}>
                          다음 <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 1 */}
                  {step === 1 && (
                    <motion.div
                      key="step-email"
                      variants={fadeUp}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Mail className="h-4 w-4" />
                        이메일 입력
                      </div>

                      <div className="space-y-2">
                        <Label>이메일 (아이디)</Label>
                        <Input
                          ref={emailRef}
                          type="email"
                          value={form.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          onKeyDown={onEnter}
                          className={
                            fieldErrors.email || (form.email?.trim() && !isEmailValid(form.email))
                              ? "border-red-500"
                              : ""
                          }
                          placeholder="owner@example.com"
                          disabled={loading || checkingEmail}
                        />

                        <p
                          className={[
                            "text-[11px]",
                            form.email?.trim() && !isEmailValid(form.email)
                              ? "text-red-500"
                              : "text-muted-foreground",
                          ].join(" ")}
                        >
                          {emailHint}
                        </p>

                        {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
                      </div>

                      <div className="flex items-center justify-between">
                        <Button type="button" variant="outline" onClick={prev}>
                          이전
                        </Button>
                        <Button type="button" onClick={next} disabled={!canGoNext(1)}>
                          다음 <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <motion.div
                      key="step-verify"
                      variants={fadeUp}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <ShieldCheck className="h-4 w-4" />
                          이메일 인증
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          {isEmailSent ? (
                            <span
                              className={[
                                "inline-flex items-center gap-1 rounded-full border px-2 py-1",
                                isExpired
                                  ? "text-red-600 border-red-200 bg-red-50"
                                  : "text-muted-foreground bg-background",
                              ].join(" ")}
                            >
                              <Clock className="h-3.5 w-3.5" />
                              {isExpired ? "만료됨" : formatMMSS(remainingSec)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-1 text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              03:00
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border bg-background p-4 text-sm">
                        <p className="font-medium">인증할 이메일</p>
                        <p className="mt-1 text-muted-foreground">{form.email || "-"}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={isEmailSent ? handleResendEmail : handleSendEmail}
                          disabled={
                            loading ||
                            !form.email?.trim() ||
                            !isEmailValid(form.email) ||
                            Boolean(fieldErrors.email)
                          }
                        >
                          {isEmailSent ? (
                            <>
                              <RotateCcw className="mr-2 h-4 w-4" />
                              재전송
                            </>
                          ) : (
                            "인증 메일 보내기"
                          )}
                        </Button>

                        <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                          이메일 수정
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>인증 코드</Label>
                        <div className="flex gap-2">
                          <Input
                            ref={codeRef}
                            value={verificationCode}
                            onChange={(e) => {
                              setVerificationCode(e.target.value);
                              if (codeError) setCodeError("");
                            }}
                            onKeyDown={onEnter}
                            placeholder="6자리 코드 입력"
                            disabled={!isEmailSent || loading || isExpired || isEmailVerified}
                            className={[
                              isEmailVerified ? "border-green-500" : "",
                              isExpired || codeError ? "border-red-300" : "",
                            ].join(" ")}
                          />
                          <Button
                            type="button"
                            onClick={handleVerifyCode}
                            disabled={!isEmailSent || !verificationCode.trim() || loading || isExpired || isEmailVerified}
                          >
                            확인
                          </Button>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {isEmailVerified ? (
                            <span className="text-green-600 font-medium">인증이 완료되었습니다.</span>
                          ) : isExpired ? (
                            <span className="text-red-600 font-medium">
                              인증 시간이 만료되었습니다. 재전송 후 다시 시도하세요.
                            </span>
                          ) : codeError ? (
                            <span className="text-red-600 font-medium">{codeError}</span>
                          ) : isEmailSent ? (
                            <span>코드 6자리를 입력해주세요.</span>
                          ) : (
                            <span>먼저 “인증 메일 보내기”를 눌러주세요.</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Button type="button" variant="outline" onClick={prev}>
                          이전
                        </Button>
                        <Button type="button" onClick={next} disabled={!canGoNext(2)}>
                          다음 <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3 */}
                  {step === 3 && (
                    <motion.div
                      key="step-password"
                      variants={fadeUp}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Lock className="h-4 w-4" />
                        비밀번호 설정
                      </div>

                      <div className="space-y-2">
                        <Label>비밀번호</Label>
                        <Input
                          ref={pwRef}
                          type="password"
                          value={form.password}
                          onChange={(e) => updateField("password", e.target.value)}
                          onKeyDown={onEnter}
                          className={fieldErrors.password ? "border-red-500" : ""}
                          placeholder="••••••••"
                          disabled={loading}
                        />
                        {fieldErrors.password && <p className="text-xs text-red-500">{fieldErrors.password}</p>}
                      </div>

                      <div className="flex items-center justify-between">
                        <Button type="button" variant="outline" onClick={prev}>
                          이전
                        </Button>
                        <Button type="button" onClick={next} disabled={!canGoNext(3)}>
                          다음 <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4 */}
                  {step === 4 && (
                    <motion.div
                      key="step-confirm"
                      variants={fadeUp}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <CheckCircle2 className="h-4 w-4" />
                        확인 및 완료
                      </div>

                      <div className="space-y-2">
                        <Label>비밀번호 확인</Label>
                        <Input
                          ref={pw2Ref}
                          type="password"
                          value={form.confirmPassword}
                          onChange={(e) => updateField("confirmPassword", e.target.value)}
                          onKeyDown={onEnter}
                          className={fieldErrors.confirmPassword ? "border-red-500" : ""}
                          placeholder="••••••••"
                          disabled={loading}
                        />
                        {fieldErrors.confirmPassword && (
                          <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <Button type="button" variant="outline" onClick={prev}>
                          이전
                        </Button>
                        <Button
                          type="button"
                          onClick={handleFinalSubmit}
                          disabled={loading || !canGoNext(4) || !isEmailVerified}
                          className="min-w-[160px]"
                        >
                          {loading ? "가입 처리 중..." : "회원가입 완료"}
                        </Button>
                      </div>

                      {!isEmailVerified && (
                        <p className="text-xs text-red-500">
                          이메일 인증이 완료되어야 회원가입을 진행할 수 있습니다.
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 border-t bg-muted/10 py-5">
              <p className="text-[11px] text-muted-foreground">
                가입 시 입력한 정보는 계정/권한 설정에 사용됩니다.
              </p>
              <div className="text-xs text-muted-foreground">
                이미 계정이 있으신가요?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  로그인
                </Link>
              </div>
            </CardFooter>
          </Card>
        </section>
      </div>
    </div>
  );
}

function MiniInfo({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
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