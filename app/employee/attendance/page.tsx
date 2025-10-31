"use client"

import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Loader2, LogIn, LogOut, RefreshCcw } from "lucide-react"

// ✅ 백엔드 베이스 URL
const API_BASE = "http://localhost:8080"

// ---------- 타입 ----------
type AttendanceItem = {
  logId: number
  employeeId: number
  storeId: number
  recordTime: string // ISO
  recordType: "IN" | "OUT"
  clientIp?: string | null
}

// ---------- 유틸 ----------
const isoDate = (d: Date) => d.toISOString().split("T")[0]
const fmtTime = (iso: string) => iso.split("T")[1]?.slice(0, 8) ?? "--:--:--"

// ---------- 컴포넌트 ----------
export default function AttendancePage() {
  // 테스트용(로그인 전): 직원/사업장 ID
  const [employeeId, setEmployeeId] = useState<string>("3")
  const [storeId, setStoreId] = useState<string>("1")

  // 날짜 선택(기본 오늘)
  const [date, setDate] = useState<Date | undefined>(new Date())

  // API 데이터 상태
  const [recent, setRecent] = useState<AttendanceItem[]>([])           // 최근 30건
  const [daily, setDaily] = useState<AttendanceItem[]>([])             // 선택 일자
  const [loadingRecent, setLoadingRecent] = useState(false)
  const [loadingDay, setLoadingDay] = useState(false)
  const [punching, setPunching] = useState<"IN" | "OUT" | null>(null)

  // 캘린더 점 표시용: 해당 월의 날짜 중 기록 존재 여부 캐시
  const datesWithRecords = useMemo(() => {
    const set = new Set<string>()
    recent.forEach((r) => set.add(r.recordTime.slice(0, 10)))
    daily.forEach((r) => set.add(r.recordTime.slice(0, 10)))
    return set
  }, [recent, daily])

  // 최초 로드 및 employeeId/storeId 변경 시 최신 이력 로드
  useEffect(() => {
    if (!employeeId || !storeId) return
    fetchRecent()
    if (date) fetchDay(date)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, storeId])

  // 날짜 바뀌면 해당 일자 로드
  useEffect(() => {
    if (date && employeeId && storeId) fetchDay(date)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  // ---- API 호출 ----
  const fetchRecent = async () => {
    if (!employeeId || !storeId) return
    try {
      setLoadingRecent(true)
      const res = await axios.get<AttendanceItem[]>(
        `${API_BASE}/api/attendance/recent`,
        { params: { employeeId: Number(employeeId), storeId: Number(storeId), limit: 30 } }
      )
      setRecent(res.data ?? [])
    } catch (e) {
      console.error("최근 기록 불러오기 실패:", e)
      alert("최근 기록을 불러오지 못했습니다.")
    } finally {
      setLoadingRecent(false)
    }
  }

  const fetchDay = async (d: Date) => {
    if (!employeeId || !storeId) return
    try {
      setLoadingDay(true)
      const res = await axios.get<AttendanceItem[]>(
        `${API_BASE}/api/attendance/day`,
        { params: { employeeId: Number(employeeId), storeId: Number(storeId), date: isoDate(d) } }
      )
      setDaily(res.data ?? [])
    } catch (e) {
      console.error("일자 기록 불러오기 실패:", e)
      alert("선택 일자의 기록을 불러오지 못했습니다.")
    } finally {
      setLoadingDay(false)
    }
  }

  const punch = async (kind: "IN" | "OUT") => {
    if (!employeeId || !storeId) {
      alert("직원 ID와 사업장 ID를 입력하세요.")
      return
    }
    try {
      setPunching(kind)
      const now = new Date().toISOString()

      // 낙관적 UI: recent 맨 앞에 잠깐 추가(실패 시 복구)
      const optimistic: AttendanceItem = {
        logId: -Date.now(),
        employeeId: Number(employeeId),
        storeId: Number(storeId),
        recordTime: now,
        recordType: kind
      }
      setRecent((prev) => [optimistic, ...prev])

      await axios.post(`${API_BASE}/api/attendance/punch`, {
        employeeId: Number(employeeId),
        storeId: Number(storeId),
        recordTime: now,
        recordType: kind,
      })

      // 성공 후 최신화
      await Promise.all([fetchRecent(), date ? fetchDay(date) : Promise.resolve()])
      alert(kind === "IN" ? "출근이 기록되었습니다." : "퇴근이 기록되었습니다.")
    } catch (e: any) {
      console.error("출퇴근 기록 실패:", e)
      // 낙관적 추가 복구
      setRecent((prev) => prev.filter((x) => x.logId >= 0))
      const msg = e?.response?.data || e?.message || "기록 중 오류가 발생했습니다."
      alert(msg)
    } finally {
      setPunching(null)
    }
  }

  // 선택 날짜의 간단 상태 파생(해당 일에 IN/OUT 존재 여부)
  const dayHasIn = daily.some((d) => d.recordType === "IN")
  const dayHasOut = daily.some((d) => d.recordType === "OUT")

  return (
    <div className="space-y-6">
      {/* 헤더 + 테스트용 ID 입력 (JWT 붙기 전까지) */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">근태 관리</h1>
        <p className="text-muted-foreground">모바일에서도 쉽게 출퇴근을 기록하세요</p>

        <div className="grid grid-cols-2 gap-2 sm:max-w-md">
          <Input
            inputMode="numeric"
            placeholder="직원 ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value.replace(/[^0-9]/g, ""))}
          />
          <Input
            inputMode="numeric"
            placeholder="사업장 ID"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value.replace(/[^0-9]/g, ""))}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 캘린더 + 오늘 찍기 */}
        <Card className="order-1 md:order-none">
          <CardHeader className="pb-2">
            <CardTitle>근무 달력</CardTitle>
            <CardDescription>날짜를 선택해 상세 기록을 확인하세요</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border w-full sm:w-auto"
            />

            {/* 오늘 찍기 퀵 액션(모바일 큰 버튼) */}
            <div className="grid grid-cols-2 gap-2 w-full sm:max-w-sm">
              <Button
                className="h-12 text-base"
                onClick={() => punch("IN")}
                disabled={punching !== null}
              >
                {punching === "IN" ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                출근
              </Button>
              <Button
                variant="outline"
                className="h-12 text-base"
                onClick={() => punch("OUT")}
                disabled={punching !== null}
              >
                {punching === "OUT" ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogOut className="mr-2 h-5 w-5" />}
                퇴근
              </Button>
            </div>

            {/* 선택일 요약 뱃지 */}
            <div className="w-full p-3 rounded-lg bg-muted flex items-center justify-between">
              <p className="text-sm font-medium">선택일: {date ? isoDate(date) : "-"}</p>
              <div className="flex gap-2">
                <Badge variant={dayHasIn ? "default" : "outline"}>출근 {dayHasIn ? "있음" : "없음"}</Badge>
                <Badge variant={dayHasOut ? "default" : "outline"}>퇴근 {dayHasOut ? "있음" : "없음"}</Badge>
              </div>
            </div>

            {/* 새로고침 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                fetchRecent()
                if (date) fetchDay(date)
              }}
              className="text-xs"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              새로고침
            </Button>
          </CardContent>
        </Card>

        {/* 이번 달 요약(샘플) */}
        <Card>
          <CardHeader>
            <CardTitle>이번 달 요약</CardTitle>
            <CardDescription>{new Date().getFullYear()}년 {new Date().getMonth() + 1}월</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">총 근무일(샘플)</p>
                <p className="text-2xl font-bold mt-1">18일</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">총 근무시간(샘플)</p>
                <p className="text-2xl font-bold mt-1">144시간</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">지각(샘플)</p>
                <p className="text-2xl font-bold mt-1">1회</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">조퇴(샘플)</p>
                <p className="text-2xl font-bold mt-1">1회</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">예상 급여(샘플)</p>
              <p className="text-3xl font-bold">₩1,440,000</p>
              <p className="text-xs text-muted-foreground mt-1">시급 ₩10,000 기준</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 출퇴근 기록 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 출퇴근 기록</CardTitle>
          <CardDescription>최근 30건</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingRecent ? (
            <div className="text-sm text-muted-foreground">불러오는 중…</div>
          ) : recent.length === 0 ? (
            <div className="text-sm text-muted-foreground">기록이 없습니다.</div>
          ) : (
            <div className="space-y-2">
              {recent.map((r) => (
                <div key={r.logId} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm font-medium">{r.recordTime.slice(0, 10)}</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div>
                      <p className="text-sm font-medium">{fmtTime(r.recordTime)}</p>
                      <p className="text-xs text-muted-foreground">{r.clientIp ?? ""}</p>
                    </div>
                  </div>
                  <Badge variant={r.recordType === "IN" ? "default" : "secondary"}>
                    {r.recordType === "IN" ? "출근" : "퇴근"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 선택 날짜의 상세 기록 */}
      <Card>
        <CardHeader>
          <CardTitle>선택일 상세 기록</CardTitle>
          <CardDescription>{date ? isoDate(date) : "-"}</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingDay ? (
            <div className="text-sm text-muted-foreground">불러오는 중…</div>
          ) : daily.length === 0 ? (
            <div className="text-sm text-muted-foreground">해당 일자의 기록이 없습니다.</div>
          ) : (
            <div className="space-y-2">
              {daily.map((r) => (
                <div key={r.logId} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm font-medium">{fmtTime(r.recordTime)}</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-xs text-muted-foreground">{r.clientIp ?? ""}</div>
                  </div>
                  <Badge variant={r.recordType === "IN" ? "default" : "secondary"}>
                    {r.recordType === "IN" ? "출근" : "퇴근"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}