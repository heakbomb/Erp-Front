"use client"

import React, { useState } from "react";
import Link from "next/link"; // ✅ Link 임포트 확인
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Store, Loader2, ListTodo, TrendingUp } from "lucide-react";

import { useAdminDashboard } from "./hooks/useAdminDashboard";

export default function AdminDashboardPageFeature() {
    const [mounted, setMounted] = useState(false);
    React.useEffect(() => { setMounted(true) }, []);

    const { statsData, isStatsLoading, statsError } = useAdminDashboard();
    const error = statsError as Error | null;

    // Hydration 방지용 스켈레톤 (변경 없음)
    if (!mounted) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
                    {/* ... (스켈레톤 UI 코드는 동일) ... */}
                    <div>
                        <div className="h-10 bg-gray-200 rounded w-64 dark:bg-gray-700"></div>
                        <div className="h-4 bg-gray-200 rounded w-80 mt-2 dark:bg-gray-700"></div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card><CardHeader><div className="h-24 bg-gray-200 rounded dark:bg-gray-700"></div></CardHeader></Card>
                        <Card><CardHeader><div className="h-24 bg-gray-200 rounded dark:bg-gray-700"></div></CardHeader></Card>
                        <Card><CardHeader><div className="h-24 bg-gray-200 rounded dark:bg-gray-700"></div></CardHeader></Card>
                        <Card><CardHeader><div className="h-24 bg-gray-200 rounded dark:bg-gray-700"></div></CardHeader></Card>
                    </div>
                    <Card>
                        <CardHeader>
                            <div className="h-8 bg-gray-200 rounded w-48 dark:bg-gray-700"></div>
                            <div className="h-4 bg-gray-200 rounded w-64 mt-2 dark:bg-gray-700"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    // 데이터 로딩 중 (변경 없음)
    if (isStatsLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    // 에러 발생 (변경 없음)
    if (error) {
        return <div className="text-red-500 text-center p-8">{error.message}</div>
    }

    // 데이터 로드 완료
    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">관리자 대시보드</h1>
                    <p className="text-muted-foreground">시스템 전체 현황을 모니터링하세요.</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">전체 사업장</CardTitle>
                            <Store className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statsData?.totalStores.toLocaleString() ?? 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statsData?.totalUsers.toLocaleString() ?? 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">활성 구독</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statsData?.activeSubscriptions.toLocaleString() ?? 0}</div>
                        </CardContent>
                    </Card>

                    {/* ✅ [수정] <Link>가 <Card>를 감싸고, legacyBehavior와 <a> 제거 */}
                    <Link href="/admin/stores?status=PENDING">
                        <Card className="hover:bg-muted/50 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-orange-600">승인 대기 사업장</CardTitle>
                                <ListTodo className="h-4 w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">
                                    {statsData?.pendingStoreCount.toLocaleString() ?? 0} 건
                                </div>
                                <p className="text-xs text-muted-foreground">클릭하여 처리하기</p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* ✅ [수정] '신규 근무 신청' 카드도 동일하게 수정 (legacyBehavior/<a> 제거) */}
                    {/*
            (참고: '신규 근무 신청' 카드가 현재 코드에 없지만,
             이전에 있었다면 이것도 아래처럼 수정해야 합니다.)
          */}
                    {/* <Link href="/admin/assignments">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader> ... </CardHeader>
              <CardContent> ... </CardContent>
            </Card>
          </Link>
          */}
                </div>

                {/* 'Recent Activities' Card (변경 없음) */}
                <Card>
                    <CardHeader>
                        <CardTitle>최근 활동 (최근 5건)</CardTitle>
                        <CardDescription>시스템 주요 감사 로그</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {statsData?.recentActivities.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center">최근 활동이 없습니다.</p>
                            )}
                            {statsData?.recentActivities.map((log) => (
                                <div key={log.auditId} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                    <div>
                                        <p className="font-medium text-sm">{log.actionType}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Target: {log.targetTable} (User: {log.userType} {log.userId})
                                        </p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}