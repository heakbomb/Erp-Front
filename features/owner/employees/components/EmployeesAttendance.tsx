// features/owner/employees/components/EmployeesAttendance.tsx
"use client";

import { useMemo } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, RefreshCcw } from "lucide-react";

import useEmployeesAttendance from "@/features/owner/employees/hooks/useEmployeesAttendance";
import type {
  EmployeeAttendanceSummary,
  OwnerAttendanceLogItem,
} from "@/features/owner/employees/services/employeesService";

function StatusBadge({
  status,
}: {
  status: EmployeeAttendanceSummary["todayStatus"];
}) {
  switch (status) {
    case "IN":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
          근무 중
        </Badge>
      );
    case "OUT":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          퇴근 완료
        </Badge>
      );
    case "ABSENT":
      return <Badge variant="destructive">미출근</Badge>;
    default:
      return <Badge variant="secondary">확인 필요</Badge>;
  }
}

export default function EmployeesAttendance() {
  const {
    storeIdInput,
    date,
    items, // 요약 카드용
    logs, // 로그 리스트용
    loading,
    banner,
    stats,
    setStoreIdInput,
    setDate,
    load,
  } = useEmployeesAttendance();

  const handleToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    setDate(today);
    load({ date: today });
  };

  // 로그 리스트용 통계
  const logStats = useMemo(() => {
    const totalLogs = logs.length;
    const inCount = logs.filter((l) => l.recordType === "IN").length;
    const outCount = logs.filter((l) => l.recordType === "OUT").length;
    const employeeCount = new Set(logs.map((l) => l.employeeId)).size;
    return { totalLogs, inCount, outCount, employeeCount };
  }, [logs]);

  return (
    <div className="space-y-6">
      {banner && (
        <div
          className={`rounded-md border p-3 text-sm ${
            banner.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {banner.message}
        </div>
      )}

      {/* ───────── 카드 1: 직원 출결 현황(요약) ───────── */}
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>직원 출결 현황</CardTitle>
              <CardDescription>
                사업장에 등록된 직원들의 오늘 출결 상태와 이번 달 근무 요약을
                한눈에 확인할 수 있습니다.
              </CardDescription>
            </div>

            {/* 필터 영역 (공통) */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                className="w-32"
                placeholder="사업장 ID"
                inputMode="numeric"
                value={storeIdInput}
                onChange={(e) =>
                  setStoreIdInput(e.target.value.replace(/[^0-9]/g, ""))
                }
              />
              <Input
                className="w-44"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Button
                size="sm"
                onClick={() => load()}
                disabled={loading}
                className="whitespace-nowrap"
              >
                {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                조회
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="whitespace-nowrap"
              >
                오늘
              </Button>
            </div>
          </div>

          {/* 상단 요약 뱃지 (summary 기준) */}
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>
              총 직원{" "}
              <Badge variant="outline" className="ml-1">
                {stats.total}명
              </Badge>
            </span>
            <span>
              근무 중{" "}
              <Badge variant="outline" className="ml-1">
                {stats.working}명
              </Badge>
            </span>
            <span>
              퇴근 완료{" "}
              <Badge variant="outline" className="ml-1">
                {stats.off}명
              </Badge>
            </span>
            <span>
              미출근{" "}
              <Badge variant="outline" className="ml-1">
                {stats.absent}명
              </Badge>
            </span>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              출결 현황을 불러오는 중…
            </div>
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              조회된 출결 데이터가 없습니다. 사업장 ID와 날짜를 확인해주세요.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>직원</TableHead>
                    <TableHead>오늘 상태</TableHead>
                    <TableHead>첫 출근</TableHead>
                    <TableHead>마지막 퇴근</TableHead>
                    <TableHead className="text-right">
                      이번 달 총 근무시간 (h)
                    </TableHead>
                    <TableHead className="text-right">
                      이번 달 지각 횟수
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row: EmployeeAttendanceSummary) => (
                    <TableRow key={row.employeeId}>
                      <TableCell>
                        <div className="font-medium">{row.name}</div>
                        {row.email && (
                          <div className="text-xs text-muted-foreground">
                            {row.email}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={row.todayStatus} />
                      </TableCell>
                      <TableCell>
                        {row.todayFirstIn
                          ? new Date(row.todayFirstIn).toLocaleTimeString(
                              "ko-KR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {row.todayLastOut
                          ? new Date(row.todayLastOut).toLocaleTimeString(
                              "ko-KR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.totalHoursThisMonth != null
                          ? row.totalHoursThisMonth.toFixed(1)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.lateCountThisMonth ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ───────── 카드 2: 출퇴근 로그 리스트 ───────── */}
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>출퇴근 로그 리스트</CardTitle>
            <CardDescription>
              선택한 사업장 / 날짜 기준으로 기록된 모든 출근 · 퇴근 로그입니다.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => load()}
            className="text-xs"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            새로고침
          </Button>
        </CardHeader>

        <CardContent>
          {/* 로그 통계 요약 */}
          <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>
              총 로그{" "}
              <Badge variant="outline" className="ml-1">
                {logStats.totalLogs}건
              </Badge>
            </span>
            <span>
              출근(IN){" "}
              <Badge variant="outline" className="ml-1">
                {logStats.inCount}건
              </Badge>
            </span>
            <span>
              퇴근(OUT){" "}
              <Badge variant="outline" className="ml-1">
                {logStats.outCount}건
              </Badge>
            </span>
            <span>
              직원 수{" "}
              <Badge variant="outline" className="ml-1">
                {logStats.employeeCount}명
              </Badge>
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              출퇴근 로그를 불러오는 중…
            </div>
          ) : logs.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              조회된 출결 로그가 없습니다. 사업장 ID와 날짜를 확인해주세요.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>직원</TableHead>
                    <TableHead>기록 시간</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((l: OwnerAttendanceLogItem) => (
                    <TableRow key={l.logId}>
                      <TableCell>
                        <div className="font-medium">
                          {l.employeeName ?? `직원 #${l.employeeId}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID {l.employeeId}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(l.recordTime).toLocaleString("ko-KR", {
                          year: "2-digit",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            l.recordType === "IN" ? "default" : "secondary"
                          }
                        >
                          {l.recordType === "IN" ? "출근" : "퇴근"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {l.clientIp ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}