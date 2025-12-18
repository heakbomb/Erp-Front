// modules/attendanceC/EmployeesAttendance.tsx
"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Loader2 } from "lucide-react";

import useEmployeesAttendance from "./useEmployeesAttendance";
import type { EmployeeAttendanceSummary, OwnerAttendanceLogItem } from "./attendanceTypes";

export default function EmployeesAttendance() {
  const {
    summaryStoreIdInput,
    summaryMonth,
    summaryEmployeeFilter,
    summaryItems,
    logStoreIdInput,
    logDate,
    logEmployeeFilter,
    logs,
    loading,
    banner,
    stats,
    setSummaryStoreIdInput,
    setSummaryMonth,
    setSummaryEmployeeFilter,
    setLogStoreIdInput,
    setLogDate,
    setLogEmployeeFilter,
    loadSummary,
    loadLogs,
  } = useEmployeesAttendance();

  const handleTodayLogs = () => {
    const today = new Date().toISOString().slice(0, 10);
    setLogDate(today);
    void loadLogs({ date: today });
  };

  const employeeOptions = useMemo<EmployeeAttendanceSummary[]>(
    () =>
      Array.from(
        new Map<number, EmployeeAttendanceSummary>(
          summaryItems.map((i) => [i.employeeId, i]),
        ).values(),
      ),
    [summaryItems],
  );

  const filteredSummaryItems = useMemo(() => {
    if (summaryEmployeeFilter === "all") return summaryItems;
    const id = Number(summaryEmployeeFilter);
    if (Number.isNaN(id)) return summaryItems;
    return summaryItems.filter((i) => i.employeeId === id);
  }, [summaryItems, summaryEmployeeFilter]);

  const filteredLogs = useMemo(() => {
    if (logEmployeeFilter === "all") return logs;
    const id = Number(logEmployeeFilter);
    if (Number.isNaN(id)) return logs;
    return logs.filter((l) => l.employeeId === id);
  }, [logs, logEmployeeFilter]);

  const logStats = useMemo(() => {
    const totalLogs = filteredLogs.length;
    const inCount = filteredLogs.filter((l) => l.recordType === "IN").length;
    const outCount = filteredLogs.filter((l) => l.recordType === "OUT").length;
    const employeeCount = new Set(filteredLogs.map((l) => l.employeeId)).size;
    return { totalLogs, inCount, outCount, employeeCount };
  }, [filteredLogs]);

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

      {/* ───────── 카드 1: 직원 출결 현황(월간 요약) ───────── */}
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>직원 출결 현황</CardTitle>
              <CardDescription>
                사업장에 등록된 직원들의 이번 달 근무 일수와 총 근무시간을 한눈에 확인할 수 있습니다.
              </CardDescription>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                className="w-32"
                placeholder="사업장 ID"
                inputMode="numeric"
                value={summaryStoreIdInput}
                onChange={(e) => setSummaryStoreIdInput(e.target.value.replace(/[^0-9]/g, ""))}
              />
              <Input
                className="w-40"
                type="month"
                value={summaryMonth}
                onChange={(e) => setSummaryMonth(e.target.value)}
              />
              <select
                className="w-40 rounded-md border px-2 py-1 text-sm"
                value={summaryEmployeeFilter}
                onChange={(e) => setSummaryEmployeeFilter(e.target.value)}
              >
                <option value="all">전체 직원</option>
                {employeeOptions.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.employeeName ?? `직원 #${emp.employeeId}`}
                  </option>
                ))}
              </select>
              <Button size="sm" onClick={() => void loadSummary()} disabled={loading} className="whitespace-nowrap">
                {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                조회
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>
              총 직원 <Badge variant="outline" className="ml-1">{stats.totalEmployees}명</Badge>
            </span>
            <span>
              이번 달 총 근무일수 <Badge variant="outline" className="ml-1">{stats.totalWorkDays}일</Badge>
            </span>
            <span>
              이번 달 총 근무시간 <Badge variant="outline" className="ml-1">{stats.totalWorkHours.toFixed(1)}h</Badge>
            </span>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 출결 현황을 불러오는 중…
            </div>
          ) : filteredSummaryItems.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              조회된 출결 데이터가 없습니다. 사업장 ID와 월을 확인해주세요.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>직원</TableHead>
                    <TableHead className="text-right">이번 달 근무일수</TableHead>
                    <TableHead className="text-right">이번 달 총 근무시간 (h)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSummaryItems.map((row) => (
                    <TableRow key={row.employeeId}>
                      <TableCell>
                        <div className="font-medium">{row.employeeName ?? `직원 #${row.employeeId}`}</div>
                      </TableCell>
                      <TableCell className="text-right">{row.workDaysThisMonth ?? 0}일</TableCell>
                      <TableCell className="text-right">{row.workHoursThisMonth != null ? row.workHoursThisMonth.toFixed(1) : "-"}</TableCell>
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
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>출퇴근 로그 리스트</CardTitle>
              <CardDescription>
                선택한 사업장 / 날짜 기준으로 기록된 모든 출근 · 퇴근 로그입니다.
              </CardDescription>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                className="w-32"
                placeholder="사업장 ID"
                inputMode="numeric"
                value={logStoreIdInput}
                onChange={(e) => setLogStoreIdInput(e.target.value.replace(/[^0-9]/g, ""))}
              />
              <Input
                className="w-44"
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
              />
              <select
                className="w-40 rounded-md border px-2 py-1 text-sm"
                value={logEmployeeFilter}
                onChange={(e) => setLogEmployeeFilter(e.target.value)}
              >
                <option value="all">전체 직원</option>
                {employeeOptions.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.employeeName ?? `직원 #${emp.employeeId}`}
                  </option>
                ))}
              </select>
              <Button size="sm" onClick={() => void loadLogs()} disabled={loading} className="whitespace-nowrap">
                {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                조회
              </Button>
              <Button variant="outline" size="sm" onClick={handleTodayLogs} className="whitespace-nowrap">
                오늘
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>총 로그 <Badge variant="outline" className="ml-1">{logStats.totalLogs}건</Badge></span>
            <span>출근(IN) <Badge variant="outline" className="ml-1">{logStats.inCount}건</Badge></span>
            <span>퇴근(OUT) <Badge variant="outline" className="ml-1">{logStats.outCount}건</Badge></span>
            <span>직원 수 <Badge variant="outline" className="ml-1">{logStats.employeeCount}명</Badge></span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 출퇴근 로그를 불러오는 중…
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              조회된 출결 로그가 없습니다. 사업장 ID와 날짜, 직원 필터를 확인해주세요.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>직원</TableHead>
                    <TableHead>기록 시간</TableHead>
                    <TableHead>유형</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((l) => (
                    <TableRow key={l.logId}>
                      <TableCell>
                        <div className="font-medium">{l.employeeName ?? `직원 #${l.employeeId}`}</div>
                        <div className="text-xs text-muted-foreground">ID {l.employeeId}</div>
                      </TableCell>
                      <TableCell>
                        {new Date(l.recordTime).toLocaleString("ko-KR", {
                          year: "2-digit", month: "2-digit", day: "2-digit",
                          hour: "2-digit", minute: "2-digit", second: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={l.recordType === "IN" ? "default" : "secondary"}>
                          {l.recordType === "IN" ? "출근" : "퇴근"}
                        </Badge>
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