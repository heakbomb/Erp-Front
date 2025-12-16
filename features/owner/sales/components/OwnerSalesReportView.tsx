"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import useOwnerSalesReport from "@/features/owner/sales/hooks/useOwnerSalesReport"
import { YearMonthSelect } from "./report/YearMonthSelect"
import { PieChartSection } from "./report/PieChartSection"
import { WeeklyGraph } from "./report/WeeklyGraph"
import { WeeklyTable } from "./report/WeeklyTable"
import { SummarySection } from "./report/SummarySection"

export default function OwnerSalesReportView() {
    const params = useSearchParams()
    const router = useRouter()
    const printableRef = useRef<HTMLDivElement | null>(null)

    const now = useMemo(() => new Date(), [])
    const initialYear = Number(params.get("year")) || now.getFullYear()
    const initialMonth = Number(params.get("month")) || now.getMonth() + 1

    const [year, setYear] = useState(initialYear)
    const [month, setMonth] = useState(initialMonth)

    useEffect(() => {
        const y = Number(params.get("year")) || now.getFullYear()
        const m = Number(params.get("month")) || now.getMonth() + 1
        setYear(y)
        setMonth(m)
    }, [params, now])

    const { data, loading, error, currentStoreId } = useOwnerSalesReport({ year, month })

    const handleChangeYearMonth = (nextYear: number, nextMonth: number) => {
        setYear(nextYear)
        setMonth(nextMonth)
        router.push(`/owner/sales/report?year=${nextYear}&month=${nextMonth}`, {
            scroll: false,
        })
    }

    const handlePrint = () => {
        if (typeof window === "undefined") return

        const prevTitle = document.title
        const title = `${year}년 ${month}월 매출 리포트`

        document.title = title
        window.print()
        document.title = prevTitle
    }

    if (!currentStoreId) {
        return <div>먼저 매장을 선택해주세요.</div>
    }

    if (loading) {
        return <div>로딩 중...</div>
    }

    if (error) {
        return <div>리포트를 불러오는 중 오류가 발생했습니다.</div>
    }

    if (!data) {
        return <div>표시할 데이터가 없습니다.</div>
    }

    const { summary, topMenus, weeklySales } = data

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">월간 매출 리포트</h1>
                    <p className="text-muted-foreground">
                        {year}년 {month}월 매출 현황 리포트
                    </p>
                </div>
                <div className="flex items-center gap-3 print:hidden">
                    <YearMonthSelect
                        year={year}
                        month={month}
                        onChange={handleChangeYearMonth}
                    />

                    <Button variant="outline" onClick={handlePrint}>
                        PDF 다운로드
                    </Button>
                </div>
            </div>

            {/* 리포트 본문 (인쇄 대상) */}
            <div
                id="report-content"
                ref={printableRef}
                className="grid gap-4 lg:grid-cols-2 bg-white p-6 rounded-xl border shadow-sm print:block print:p-8"
            >
                {/* 프린트용 헤더 (있다면) */}
                <div className="col-span-2 mb-4 hidden print:block text-center">
                    <h1 className="text-2xl font-semibold">
                        {year}년 {month}월 매출 리포트
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        지점 매출 현황 · 인기 메뉴 · 주간 추이
                    </p>
                </div>

                <div className="space-y-4">
                    <Card className="print-avoid-break">
                        <CardHeader>
                            <CardTitle>인기 메뉴 비율</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PieChartSection data={topMenus} />
                        </CardContent>
                    </Card>

                    <Card className="print-avoid-break">
                        <CardHeader>
                            <CardTitle>요약</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SummarySection summary={summary} />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card className="print-avoid-break">
                        <CardHeader>
                            <CardTitle>주간 매출 추이</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <WeeklyGraph data={weeklySales} />
                        </CardContent>
                    </Card>

                    <Card className="print-avoid-break">
                        <CardHeader>
                            <CardTitle>주간 매출 상세</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <WeeklyTable data={weeklySales} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}