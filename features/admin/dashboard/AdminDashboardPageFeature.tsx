"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Users, Store, Loader2, ListTodo, TrendingUp, MessageCircleQuestion } from "lucide-react"; // 아이콘 추가

import { useAdminDashboard } from "./hooks/useAdminDashboard";

export default function AdminDashboardPageFeature() {
    const [mounted, setMounted] = useState(false);
    
    // Hydration Mismatch 방지
    useEffect(() => { setMounted(true) }, []);

    const { statsData, isStatsLoading, statsError } = useAdminDashboard();
    const error = statsError as Error | null;

    // 1. 초기 로딩 (Skeleton)
    if (!mounted) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
                    <div>
                        <div className="h-10 bg-gray-200 rounded w-64 dark:bg-gray-700"></div>
                        <div className="h-4 bg-gray-200 rounded w-80 mt-2 dark:bg-gray-700"></div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i}><CardHeader><div className="h-24 bg-gray-200 rounded dark:bg-gray-700"></div></CardHeader></Card>
                        ))}
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

    // 2. 데이터 로딩 중
    if (isStatsLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    // 3. 에러 발생
    if (error) {
        return <div className="text-red-500 text-center p-8">데이터를 불러오지 못했습니다: {error.message}</div>
    }

    // 4. 데이터 렌더링
    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* 상단 헤더 */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground">관리자 대시보드</h1>
                    <p className="text-muted-foreground">시스템 전체 현황을 모니터링하세요.</p>
                </div>

                {/* 통계 카드 영역 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    
                    {/* 1) 전체 사업장 */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">전체 사업장</CardTitle>
                            <Store className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statsData?.totalStores.toLocaleString() ?? 0}</div>
                        </CardContent>
                    </Card>

                    {/* 2) 전체 사용자 */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statsData?.totalUsers.toLocaleString() ?? 0}</div>
                        </CardContent>
                    </Card>

                    {/* 3) 활성 구독 */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">활성 구독</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statsData?.activeSubscriptions.toLocaleString() ?? 0}</div>
                        </CardContent>
                    </Card>

                    {/* 4) 승인 대기 사업장 (클릭 시 이동) */}
                    <Link href="/admin/stores?status=PENDING" className="block">
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-orange-600">승인 대기 사업장</CardTitle>
                                <ListTodo className="h-4 w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">
                                    {statsData?.pendingStoreCount.toLocaleString() ?? 0} 건
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">클릭하여 처리하기</p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* 5) [NEW] 문의 대기 (클릭 시 이동) */}
                    <Link href="/admin/inquiries?status=PENDING" className="block">
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-blue-600">문의 대기</CardTitle>
                                <MessageCircleQuestion className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">
                                    {statsData?.pendingInquiryCount?.toLocaleString() ?? 0} 건
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">답변 대기 중인 문의사항</p>
                            </CardContent>
                        </Card>
                    </Link>

                </div>

                {/* 최근 활동 로그 */}
                <Card>
                    <CardHeader>
                        <CardTitle>최근 활동 (최근 5건)</CardTitle>
                        <CardDescription>시스템 주요 감사 로그</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {(statsData?.recentActivities?.length ?? 0) === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">최근 활동이 없습니다.</p>
                            ) : (
                                statsData?.recentActivities.map((log) => (
                                    <div key={log.auditId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm">{log.actionType}</span>
                                                <span className="text-xs text-muted-foreground px-2 py-0.5 bg-background rounded border">
                                                    {log.targetTable}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                User: {log.userType} (ID: {log.userId})
                                            </p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}