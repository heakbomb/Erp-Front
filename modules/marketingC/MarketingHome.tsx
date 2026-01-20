"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Boxes,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  FileText,
  LineChart,
  Lock,
  Sparkles,
  Store,
  Users,
  ShoppingCart,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

type SectionId = "top" | "diff" | "modules" | "how" | "project" | "faq";

type ScreenKey = "dashboard" | "attendance" | "payroll" | "sales" | "inventory" | "purchase" | "menu" | "ai";

type Screen = {
  key: ScreenKey;
  label: string;
  desc: string;
  src: string; // public 루트 기준
  icon: React.ReactNode;
  badge?: string;
};

type CounterSpec = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
};

export default function MarketingHome() {
  const sectionIds: SectionId[] = ["top", "diff", "modules", "how", "project", "faq"];
  const [active, setActive] = useState<SectionId>("top");

  const refs = useRef<Record<SectionId, HTMLElement | null>>({
    top: null,
    diff: null,
    modules: null,
    how: null,
    project: null,
    faq: null,
  });

  const reduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 18 },
    show: { opacity: 1, y: 0 },
  };

  const stagger = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.08,
      },
    },
  };

  const sections = useMemo(
    () => [
      { id: "top" as const, label: "소개" },
      { id: "diff" as const, label: "차별점" },
      { id: "modules" as const, label: "주요 기능" },
      { id: "how" as const, label: "이용 흐름" },
      { id: "project" as const, label: "프로젝트" },
      { id: "faq" as const, label: "FAQ" },
    ],
    []
  );

  // ===== 기능별 화면(이미지) =====
  const screens: Screen[] = useMemo(
    () => [
      {
        key: "dashboard",
        label: "대시보드",
        desc: "매출/재고/근태 핵심 지표를 한 화면에서 확인",
        src: "/Maindashboard.png",
        icon: <BarChart3 className="h-4 w-4" />,
        badge: "Overview",
      },
      {
        key: "attendance",
        label: "근태",
        desc: "출퇴근/근무기록과 스케줄 기반 집계",
        src: "/attendance.png",
        icon: <CalendarClock className="h-4 w-4" />,
      },
      {
        key: "payroll",
        label: "급여",
        desc: "근태 데이터 기반 급여 산정/조회(확장)",
        src: "/payroll.png",
        icon: <Users className="h-4 w-4" />,
      },
      {
        key: "sales",
        label: "매출",
        desc: "기간/메뉴별 매출 분석 및 추세 확인",
        src: "/menu.png", // 네 프로젝트에서 매출 화면이 menu.png로 보이는 경우가 많아 연결(필요하면 sales.png로 바꿔)
        icon: <LineChart className="h-4 w-4" />,
      },
      {
        key: "purchase",
        label: "매입/발주",
        desc: "발주 이력/상태 관리 및 흐름 연결",
        src: "/purchase.png",
        icon: <ShoppingCart className="h-4 w-4" />,
      },
      {
        key: "inventory",
        label: "재고",
        desc: "레시피 기반 소진량 추적 및 재고 관리",
        src: "/inventory.png",
        icon: <Package className="h-4 w-4" />,
      },
      {
        key: "menu",
        label: "메뉴",
        desc: "메뉴/레시피/원가 관리(확장)",
        src: "/menu.png",
        icon: <Boxes className="h-4 w-4" />,
      },
      {
        key: "ai",
        label: "AI 리포트",
        desc: "수요 예측/운영 인사이트 리포트(확장)",
        src: "/ai.png",
        icon: <Cpu className="h-4 w-4" />,
        badge: "AI",
      },
    ],
    []
  );

  // sales 화면 이미지가 따로 있다면 여기만 수정하면 됨
  // 예: src: "/sales.png"

  // ===== 스크롤 섹션 활성화 =====
  useEffect(() => {
    const targets = sectionIds.map((id) => refs.current[id]).filter(Boolean) as HTMLElement[];
    if (targets.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        if (!visible?.target) return;
        const id = visible.target.getAttribute("data-section-id") as SectionId | null;
        if (id) setActive(id);
      },
      { root: null, threshold: [0.15, 0.25, 0.35, 0.5, 0.65] }
    );

    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [sectionIds]);

  const scrollTo = (id: SectionId) => {
    const el = refs.current[id];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ===== C안 동적 요소 1: 운영 흐름 칩 하이라이트 =====
  const flowChips = useMemo(() => ["근태", "급여", "발주", "재고/레시피", "매출"] as const, []);
  const [flowIdx, setFlowIdx] = useState(0);
  useEffect(() => {
    if (reduceMotion) return;
    const t = window.setInterval(() => setFlowIdx((v) => (v + 1) % flowChips.length), 1300);
    return () => window.clearInterval(t);
  }, [reduceMotion, flowChips.length]);

  // ===== C안 동적 요소 2: KPI 카운트업 =====
  const counters: CounterSpec[] = useMemo(
    () => [
      { label: "오늘 매출", value: 1230000, prefix: "₩", hint: "실시간 집계(예시)" },
      { label: "근무 중 직원", value: 5, suffix: "명", hint: "스케줄/근태 연동" },
      { label: "재고 부족", value: 2, suffix: "건", hint: "안전재고 알림(확장)" },
    ],
    []
  );

  const [counterOn, setCounterOn] = useState(false);
  const [counterVals, setCounterVals] = useState<number[]>(() => counters.map(() => 0));

  useEffect(() => {
    const el = refs.current.top;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const isIn = entries.some((e) => e.isIntersecting);
        if (isIn) setCounterOn(true);
      },
      { threshold: [0.25] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!counterOn) return;
    if (reduceMotion) {
      setCounterVals(counters.map((c) => c.value));
      return;
    }

    const durationMs = 900;
    const start = performance.now();
    const from = counterVals.slice();
    const to = counters.map((c) => c.value);

    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setCounterVals(to.map((target, i) => Math.round(from[i] + (target - from[i]) * eased)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counterOn, reduceMotion]);

  // ===== HERO 캐러셀: 자동+수동+탭 연동 =====
  const heroOrder: ScreenKey[] = useMemo(
    () => ["dashboard", "attendance", "payroll", "purchase", "inventory", "menu", "ai"],
    []
  );
  const heroScreens = useMemo(
    () => heroOrder.map((k) => screens.find((s) => s.key === k)!).filter(Boolean),
    [heroOrder, screens]
  );

  const [heroIdx, setHeroIdx] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  const goHero = useCallback(
    (nextIdx: number) => {
      const len = heroScreens.length;
      const norm = ((nextIdx % len) + len) % len;
      setHeroIdx(norm);
    },
    [heroScreens.length]
  );

  const nextHero = useCallback(() => goHero(heroIdx + 1), [goHero, heroIdx]);
  const prevHero = useCallback(() => goHero(heroIdx - 1), [goHero, heroIdx]);

  useEffect(() => {
    if (reduceMotion) return;
    if (heroPaused) return;
    const t = window.setInterval(() => setHeroIdx((v) => (v + 1) % heroScreens.length), 3800);
    return () => window.clearInterval(t);
  }, [reduceMotion, heroPaused, heroScreens.length]);

  // modules 탭과 캐러셀 연동(기능 클릭 → 해당 이미지로 이동)
  const [moduleTab, setModuleTab] = useState<string>("sales");
  const moduleToScreenKey = useMemo<Record<string, ScreenKey>>(
    () => ({
      sales: "sales",
      inventory: "inventory",
      hr: "attendance", // hr 탭은 근태/급여 중 대표로 근태
      ai: "ai",
    }),
    []
  );

  useEffect(() => {
    const key = moduleToScreenKey[moduleTab];
    if (!key) return;
    const idx = heroScreens.findIndex((s) => s.key === key);
    if (idx >= 0) setHeroIdx(idx);
  }, [moduleTab, heroScreens, moduleToScreenKey]);

  // ===== 페이지 콘텐츠 =====
  const differentiators = [
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: "요식업에 최적화된 운영 흐름",
      desc: "근태 → 급여 → 발주 → 재고/레시피 → 매출까지, 식당 운영 순서대로 기능이 연결됩니다.",
    },
    {
      icon: <Boxes className="h-5 w-5" />,
      title: "레시피 기반 재고/소진량",
      desc: "메뉴 판매량을 재료 소진량으로 환산해 재고를 정확하게 추적하고 발주 결정을 돕습니다.",
    },
    {
      icon: <CalendarClock className="h-5 w-5" />,
      title: "근무/근태/급여까지 원클릭",
      desc: "직원 스케줄과 출퇴근 기록을 기반으로 급여 산정 데이터를 일관되게 관리합니다.",
    },
    {
      icon: <LineChart className="h-5 w-5" />,
      title: "데이터 기반 인사이트 & 예측",
      desc: "날씨/요일/이벤트 등의 변수를 반영해 수요 예측과 운영 리포트를 제공합니다.",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "권한 기반 협업 (사장/직원/관리자)",
      desc: "JWT + RBAC로 역할에 맞는 메뉴/데이터만 노출하고, 매장 단위 권한도 분리합니다.",
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: "보안/감사 로그 중심 설계",
      desc: "세션/로그 기록을 남겨 운영 이력 추적과 문제 분석이 가능하도록 설계합니다.",
    },
  ];

  const moduleTabs = [
    {
      key: "sales",
      label: "매출",
      icon: <BarChart3 className="h-4 w-4" />,
      bullets: ["일/주/월 매출 대시보드", "메뉴별 매출/수량 분석", "기간 비교 및 추세 확인"],
    },
    {
      key: "inventory",
      label: "재고/발주",
      icon: <Boxes className="h-4 w-4" />,
      bullets: ["레시피 기반 소진량 추적", "발주 이력/상태 관리", "품목별 안전재고 알림(확장)"],
    },
    {
      key: "hr",
      label: "인사/근태",
      icon: <Users className="h-4 w-4" />,
      bullets: ["근무 시간표/근태 기록", "급여 산정 데이터 자동 집계", "문서/계약 관리(확장)"],
    },
    {
      key: "ai",
      label: "AI 리포트",
      icon: <Cpu className="h-4 w-4" />,
      bullets: ["수요 예측 기반 운영 제안", "이상치/급등락 감지", "요약 리포트 자동 생성(확장)"],
    },
  ];

  const faq = [
    {
      q: "직원은 회원가입 없이 사용할 수 있나요?",
      a: "직원은 소셜 로그인으로 간단히 계정을 생성하고, 사장이 초대/승인하면 매장 기능을 사용할 수 있게 설계하는 것을 권장합니다.",
    },
    {
      q: "다른 ERP와 가장 큰 차이점은 뭔가요?",
      a: "요식업 운영 흐름(근태→급여→발주→재고/레시피→매출)에 맞춘 연결 구조와, 매장 단위 권한 분리(RBAC)입니다.",
    },
    {
      q: "처음 도입할 때 무엇부터 하면 되나요?",
      a: "사장 회원가입→로그인→사업장 등록→직원 초대→근무/메뉴/재고를 세팅한 뒤 운영을 시작하면 됩니다.",
    },
  ];

  const currentHero = heroScreens[heroIdx];

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <button
            onClick={() => scrollTo("top")}
            className="flex items-center gap-2 font-semibold tracking-tight"
            aria-label="Go to top"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl border">
              <Store className="h-4 w-4" />
            </span>
            <span>요식업 ERP</span>
            <Badge variant="secondary" className="ml-1">
              beta
            </Badge>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={[
                  "rounded-lg px-3 py-1.5 text-sm transition",
                  active === s.id ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/60",
                ].join(" ")}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">로그인</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/sign-up">사장 회원가입</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main className="mx-auto max-w-6xl px-4">
        <motion.section
          ref={(el) => {
            refs.current.top = el;
          }}
          data-section-id="top"
          className="relative py-14 md:py-20"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* background depth */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 opacity-40 blur-3xl">
              <motion.div
                className="mx-auto mt-8 h-40 w-[70%] rounded-full bg-muted"
                animate={reduceMotion ? undefined : { y: [0, -10, 0], scale: [1, 1.02, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,theme(colors.muted)_0,transparent_55%)] opacity-60" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,theme(colors.background))]" />
          </div>

          <div className="grid gap-10 md:grid-cols-12 md:items-center">
            {/* left */}
            <div className="md:col-span-7">
              <Badge variant="secondary" className="mb-4">
                매장 운영을 한 화면에서
              </Badge>

              <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                요식업 운영을 위한
                <span className="block">올인원 ERP 플랫폼</span>
              </h1>

              <p className="mt-4 max-w-xl text-muted-foreground md:text-lg">
                근태/급여, 발주/재고, 매출 분석, AI 리포트까지. 요식업 운영 흐름에 맞춰 필요한 기능을 직관적으로
                연결했습니다.
              </p>

              {/* animated flow chips */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {flowChips.map((c, i) => {
                  const on = i === flowIdx;
                  return (
                    <motion.span
                      key={c}
                      className={[
                        "inline-flex items-center rounded-full border px-3 py-1 text-xs",
                        on ? "bg-muted text-foreground" : "text-muted-foreground",
                      ].join(" ")}
                      animate={reduceMotion ? undefined : on ? { scale: 1.04, y: -1 } : { scale: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      {c}
                      {i !== flowChips.length - 1 && <span className="ml-2 text-muted-foreground/60">→</span>}
                    </motion.span>
                  );
                })}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button asChild className="gap-2 group">
                  <Link href="/login">
                    로그인 후 이용하기{" "}
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => scrollTo("diff")}>
                  차별점 보기
                </Button>
                <Button variant="ghost" onClick={() => scrollTo("modules")}>
                  기능 둘러보기
                </Button>
              </div>

              {/* KPI counters */}
              <motion.div
                className="mt-8 grid gap-3 sm:grid-cols-3"
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
              >
                {counters.map((c, idx) => (
                  <motion.div key={c.label} variants={fadeUp}>
                    <KpiCard
                      title={c.label}
                      value={counterVals[idx] ?? 0}
                      prefix={c.prefix}
                      suffix={c.suffix}
                      hint={c.hint}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* right: CAROUSEL */}
            <div className="md:col-span-5">
              <motion.div
                className="relative"
                animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                onMouseEnter={() => setHeroPaused(true)}
                onMouseLeave={() => setHeroPaused(false)}
              >
                <Card className="overflow-hidden rounded-2xl shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        화면 미리보기
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1">
                          {currentHero.icon}
                          {currentHero.label}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="grid gap-3 text-sm text-muted-foreground">
                    {/* image */}
                    <div className="relative overflow-hidden rounded-xl border aspect-[16/10] bg-muted">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentHero.key}
                          className="absolute inset-0"
                          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -10 }}
                          transition={{ duration: 0.28, ease: "easeOut" }}
                        >
                          <Image
                            src={currentHero.src}
                            alt={`${currentHero.label} 화면`}
                            fill
                            priority
                            className="object-contain p-2"
                          />
                        </motion.div>
                      </AnimatePresence>

                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.35),transparent_60%)]" />
                      <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
                        {currentHero.badge && <Badge variant="secondary">{currentHero.badge}</Badge>}
                        <Badge variant="secondary" className="gap-1">
                          {currentHero.icon}
                          {currentHero.label}
                        </Badge>
                      </div>

                      {/* controls */}
                      <div className="absolute inset-y-0 left-2 flex items-center">
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                          onClick={prevHero}
                          aria-label="이전 화면"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute inset-y-0 right-2 flex items-center">
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                          onClick={nextHero}
                          aria-label="다음 화면"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* dots */}
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-background/70 px-2 py-1 backdrop-blur">
                        {heroScreens.map((s, i) => (
                          <button
                            key={s.key}
                            type="button"
                            onClick={() => goHero(i)}
                            className={[
                              "h-1.5 rounded-full transition-all",
                              i === heroIdx ? "w-5 bg-foreground" : "w-2.5 bg-muted-foreground/40 hover:bg-muted-foreground/60",
                            ].join(" ")}
                            aria-label={`${s.label} 보기`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* quick tabs to jump */}
                    <div className="grid gap-2">
                      <div className="flex flex-wrap gap-2">
                        {heroScreens.map((s, i) => (
                          <button
                            key={s.key}
                            onClick={() => goHero(i)}
                            className={[
                              "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition",
                              i === heroIdx ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60",
                            ].join(" ")}
                            aria-label={`${s.label} 이동`}
                          >
                            {s.icon}
                            {s.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">{currentHero.desc}</p>
                    </div>

                    <Separator />

                    <div className="grid gap-2">
                      <Bullet>사장: 회원가입 → 로그인 → 사업장 등록</Bullet>
                      <Bullet>직원: 소셜 로그인 → 초대/승인 → 근무/근태</Bullet>
                      <Bullet>매출/재고/발주/급여 데이터가 하나의 흐름으로 연결</Bullet>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-2">
                      <Button asChild variant="outline" className="justify-between group">
                        <Link href="/login">
                          직원 로그인(소셜)
                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                      <Button asChild className="justify-between group">
                        <Link href="/sign-up">
                          사장 회원가입
                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[28px] bg-muted/40 blur-2xl" />
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* DIFFERENTIATORS */}
        <motion.section
          ref={(el) => {
            refs.current.diff = el;
          }}
          data-section-id="diff"
          className="py-12 md:py-16"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">다른 ERP와의 차별점</h2>
              <p className="mt-2 text-muted-foreground">
                “요식업 운영”을 기준으로 필요한 기능을 연결하고, 권한/보안을 기본값으로 설계했습니다.
              </p>
            </div>
            <Badge variant="outline" className="hidden md:inline-flex">
              UX 중심
            </Badge>
          </div>

          <motion.div
            className="mt-7 grid gap-4 md:grid-cols-3"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {differentiators.map((d) => (
              <motion.div key={d.title} variants={fadeUp} transition={{ duration: 0.35, ease: "easeOut" }}>
                <Card className="rounded-2xl transition-all hover:-translate-y-1 hover:shadow-sm">
                  <CardHeader className="space-y-2">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-background">
                      {d.icon}
                    </div>
                    <CardTitle className="text-base">{d.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">{d.desc}</CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* MODULES (탭 클릭 시 HERO 캐러셀 연동됨) */}
        <motion.section
          ref={(el) => {
            refs.current.modules = el;
          }}
          data-section-id="modules"
          className="py-12 md:py-16"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <h2 className="text-2xl font-bold md:text-3xl">주요 기능</h2>
          <p className="mt-2 text-muted-foreground">
            꼭 필요한 기능부터 시작하고, 운영 데이터가 쌓일수록 AI 리포트로 확장합니다.
          </p>

          <div className="mt-7">
            <Tabs value={moduleTab} onValueChange={setModuleTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                {moduleTabs.map((t) => (
                  <TabsTrigger key={t.key} value={t.key} className="gap-2">
                    {t.icon}
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {moduleTabs.map((t) => (
                <TabsContent key={t.key} value={t.key} className="mt-4">
                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {t.icon}
                        {t.label} 모듈
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2 text-sm text-muted-foreground">
                      {t.bullets.map((b) => (
                        <Bullet key={b}>{b}</Bullet>
                      ))}
                      <Separator />
                      <p className="text-xs text-muted-foreground">
                        위 탭을 클릭하면 상단 “화면 미리보기” 이미지가 해당 기능 화면으로 자동 전환됩니다.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </motion.section>

        {/* HOW IT WORKS */}
        <motion.section
          ref={(el) => {
            refs.current.how = el;
          }}
          data-section-id="how"
          className="py-12 md:py-16"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <h2 className="text-2xl font-bold md:text-3xl">이용 흐름</h2>
          <p className="mt-2 text-muted-foreground">처음 도입부터 운영까지, 가장 단순한 흐름으로 설계합니다.</p>

          <motion.div
            className="mt-7 grid gap-4 md:grid-cols-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={fadeUp}>
              <StepCard
                title="1. 사장 회원가입"
                icon={<CheckCircle2 className="h-5 w-5" />}
                desc="계정 생성 후 로그인합니다."
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StepCard
                title="2. 사업장 등록"
                icon={<Store className="h-5 w-5" />}
                desc="매장 정보를 등록하고 기본 설정을 합니다."
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StepCard
                title="3. 직원 초대/승인"
                icon={<Users className="h-5 w-5" />}
                desc="직원은 소셜 로그인 후 초대/승인으로 연결됩니다."
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StepCard
                title="4. 운영 & 리포트"
                icon={<BarChart3 className="h-5 w-5" />}
                desc="근태/재고/매출 데이터가 쌓이면 리포트가 더 강해집니다."
              />
            </motion.div>
          </motion.div>
        </motion.section>

        {/* PROJECT */}
        <motion.section
          ref={(el) => {
            refs.current.project = el;
          }}
          data-section-id="project"
          className="py-12 md:py-16"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <h2 className="text-2xl font-bold md:text-3xl">프로젝트 소개</h2>
          <p className="mt-2 text-muted-foreground">
            소상공인(요식업) 운영에 필요한 핵심 기능을 빠르게 구현하고, 확장 가능한 구조로 설계합니다.
          </p>

          <motion.div
            className="mt-7 grid gap-4 md:grid-cols-2"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={fadeUp}>
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Cpu className="h-5 w-5" />
                    기술 스택 & 구조
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm text-muted-foreground">
                  <Bullet>Frontend: Next.js(App Router) + UI 컴포넌트 기반 설계</Bullet>
                  <Bullet>Backend: Spring Boot + JWT + Spring Security</Bullet>
                  <Bullet>DB: MySQL (매장/직원/근태/급여/재고/매출)</Bullet>
                  <Bullet>AI(확장): 수요 예측/추천/리포트 자동화</Bullet>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lock className="h-5 w-5" />
                    보안/권한 설계
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm text-muted-foreground">
                  <Bullet>권한: 사장/직원/관리자 Role 기반 접근 제어</Bullet>
                  <Bullet>매장 컨텍스트: 매장 단위로 데이터 접근을 제한</Bullet>
                  <Bullet>감사/로그: 운영 이력 추적을 위한 로그 설계(확장)</Bullet>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          ref={(el) => {
            refs.current.faq = el;
          }}
          data-section-id="faq"
          className="py-12 md:py-16"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <h2 className="text-2xl font-bold md:text-3xl">FAQ</h2>
          <p className="mt-2 text-muted-foreground">자주 나오는 질문을 정리했습니다.</p>

          <div className="mt-7">
            <Accordion type="single" collapsible className="w-full">
              {faq.map((f, idx) => (
                <AccordionItem key={f.q} value={`item-${idx}`}>
                  <AccordionTrigger>{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <Card className="mt-10 rounded-2xl">
            <CardContent className="flex flex-col items-start justify-between gap-4 p-6 md:flex-row md:items-center">
              <div>
                <h3 className="text-xl font-semibold">지금 시작해볼까요?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  로그인 후 서비스를 이용할 수 있습니다. 사장 계정은 회원가입이 필요합니다.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
                <Button asChild className="gap-2 group">
                  <Link href="/login">
                    로그인 후 이용하기{" "}
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/sign-up">사장 회원가입</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <footer className="py-10 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Restaurant ERP Project. All rights reserved.
        </footer>
      </main>

      {/* Mobile bottom quick nav */}
      <div className="fixed bottom-3 left-0 right-0 z-40 mx-auto w-[92%] max-w-md md:hidden">
        <Card className="rounded-2xl">
          <CardContent className="flex items-center justify-between p-2">
            <button
              onClick={() => scrollTo(active)}
              className="rounded-xl px-3 py-2 text-sm font-medium"
              aria-label="Current section"
            >
              {sections.find((s) => s.id === active)?.label ?? "소개"}
            </button>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/login">로그인</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">회원가입</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  prefix,
  suffix,
  hint,
}: {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="mt-1 text-lg font-semibold tabular-nums">
          {prefix ?? ""}
          {formatNumber(value)}
          {suffix ?? ""}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function formatNumber(n: number) {
  try {
    return new Intl.NumberFormat("ko-KR").format(n);
  } catch {
    return String(n);
  }
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border">
        <CheckCircle2 className="h-3.5 w-3.5" />
      </span>
      <p className="leading-relaxed">{children}</p>
    </div>
  );
}

function StepCard({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="space-y-2">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border">{icon}</div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{desc}</CardContent>
    </Card>
  );
}