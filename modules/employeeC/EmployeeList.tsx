// modules/employeeC/EmployeeList.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Search, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import useEmployeeList from "./useEmployeeList";

import { fetchOwnerTodayAttendanceLogs } from "@/modules/attendanceC/attendanceApi";
import { useStore } from "@/contexts/StoreContext";

type WorkStatus = "WORKING" | "OFF" | "NONE";
type FilterMode = "ALL" | "WORKING" | "OFF" | "NONE";

function buildWorkStatusMap(params: {
  employeeIds: number[];
  logs: { employeeId: number; recordTime: string; recordType: "IN" | "OUT" }[];
}) {
  const { employeeIds, logs } = params;

  // employeeId -> latest log
  const latestByEmp = new Map<number, { recordTime: string; recordType: "IN" | "OUT" }>();

  for (const l of logs) {
    const prev = latestByEmp.get(l.employeeId);
    if (!prev || Date.parse(l.recordTime) > Date.parse(prev.recordTime)) {
      latestByEmp.set(l.employeeId, { recordTime: l.recordTime, recordType: l.recordType });
    }
  }

  const map: Record<number, WorkStatus> = {};
  for (const id of employeeIds) {
    const last = latestByEmp.get(id);

    // ✅ 오늘 기록이 아예 없으면 NONE (중요!)
    if (!last) {
      map[id] = "NONE";
      continue;
    }

    // ✅ 마지막 로그 기준 상태 결정
    map[id] = last.recordType === "IN" ? "WORKING" : "OFF";
  }

  return map;
}

export default function EmployeeList() {
  const {
    searchQuery,
    setSearchQuery,
    handleKeyDown,
    employees,
    filtered,
    loading,
    banner,
    openDelete,
    setOpenDelete,
    targetToDelete,
    setTargetToDelete,
    confirmDelete,
    formatDate,
  } = useEmployeeList();

  const { currentStoreId } = useStore();

  const [workStatusMap, setWorkStatusMap] = useState<Record<number, WorkStatus>>({});
  const [workStatusLoading, setWorkStatusLoading] = useState(false);

  // ✅ 필터 (기본 ALL)
  const [filterMode, setFilterMode] = useState<FilterMode>("ALL");

  const employeeIds = useMemo(() => employees.map((e) => e.employeeId), [employees]);

  useEffect(() => {
    if (!currentStoreId || employeeIds.length === 0) {
      setWorkStatusMap({});
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setWorkStatusLoading(true);
        const logs = await fetchOwnerTodayAttendanceLogs(currentStoreId);
        if (cancelled) return;

        const next = buildWorkStatusMap({
          employeeIds,
          logs: logs as any,
        });

        setWorkStatusMap(next);
      } catch {
        if (!cancelled) setWorkStatusMap({});
      } finally {
        if (!cancelled) setWorkStatusLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentStoreId, employeeIds]);

  const StatusDot = ({ status }: { status: WorkStatus }) => {
    const cls =
      status === "WORKING"
        ? "bg-green-500"
        : status === "OFF"
          ? "bg-red-500"
          : "bg-slate-300";

    const title = status === "WORKING" ? "근무중" : status === "OFF" ? "퇴근" : "기록없음";

    return (
      <span
        className={"inline-block h-2.5 w-2.5 rounded-full " + cls}
        title={title}
      />
    );
  };

  // ✅ 표시용: 검색 필터(filtered)에 + 상태 필터
  const visibleEmployees = useMemo(() => {
    if (filterMode === "ALL") return filtered;

    return filtered.filter((e) => {
      const status = workStatusMap[e.employeeId] ?? "NONE";
      return status === filterMode;
    });
  }, [filtered, filterMode, workStatusMap]);

  // ✅ 카운트도 동일 규칙으로 계산
  const counts = useMemo(() => {
    let working = 0;
    let off = 0;
    let none = 0;

    for (const e of filtered) {
      const s = workStatusMap[e.employeeId] ?? "NONE";
      if (s === "WORKING") working += 1;
      else if (s === "OFF") off += 1;
      else none += 1;
    }

    return { working, off, none, total: filtered.length };
  }, [filtered, workStatusMap]);

  const FilterBtn = ({
    mode,
    label,
  }: {
    mode: FilterMode;
    label: React.ReactNode;
  }) => (
    <Button
      type="button"
      variant={filterMode === mode ? "default" : "outline"}
      size="sm"
      className="h-7 px-2"
      onClick={() => setFilterMode(mode)}
    >
      {label}
    </Button>
  );

  return (
    <div className="space-y-6">
      {banner && (
        <div
          className={`p-3 text-sm rounded border ${
            banner.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {banner.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center gap-3">
            <div>
              <CardTitle className="flex items-center gap-3">
                직원 목록

                {/* ✅ 필터/카운트 */}
                <span className="ml-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <FilterBtn
                    mode="WORKING"
                    label={
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        근무중 {counts.working}
                      </span>
                    }
                  />
                  <FilterBtn
                    mode="OFF"
                    label={
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                        퇴근 {counts.off}
                      </span>
                    }
                  />
                  <FilterBtn
                    mode="NONE"
                    label={
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                        기록없음 {counts.none}
                      </span>
                    }
                  />
                  <FilterBtn mode="ALL" label={<>전체 {counts.total}</>} />
                </span>

                {workStatusLoading && (
                  <span className="text-xs text-muted-foreground">(상태 갱신 중...)</span>
                )}
              </CardTitle>
              <CardDescription>{employees.length}명의 직원이 있습니다.</CardDescription>
            </div>

            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-sm">로딩 중...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">근무상태</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>전화번호</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>가입일</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {visibleEmployees.map((e, idx) => {
                  const status = workStatusMap[e.employeeId] ?? "NONE";

                  return (
                    <TableRow key={e.employeeId || idx}>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <StatusDot status={status} />
                        </div>
                      </TableCell>

                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{e.name || "-"}</span>

                          {status === "WORKING" && (
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-700 border-green-200"
                            >
                              근무중
                            </Badge>
                          )}

                          {status === "OFF" && (
                            <Badge
                              variant="outline"
                              className="bg-red-100 text-red-700 border-red-200"
                            >
                              퇴근
                            </Badge>
                          )}

                          {status === "NONE" && (
                            <Badge variant="secondary" className="border">
                              기록없음
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>{e.email || "-"}</TableCell>
                      <TableCell>{e.phone || "-"}</TableCell>
                      <TableCell>
                        {e.provider ? <Badge variant="secondary">{e.provider}</Badge> : "-"}
                      </TableCell>
                      <TableCell>{formatDate(e.createdAt)}</TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setTargetToDelete(e);
                                setOpenDelete(true);
                              }}
                            >
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {visibleEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>직원 삭제</DialogTitle>
            <DialogDescription>
              {targetToDelete?.name} 직원을 삭제(배정 해제)하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}