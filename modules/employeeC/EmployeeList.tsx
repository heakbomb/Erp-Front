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

// ✅ 오늘 로그 API (attendanceApi.ts에서 추가한 Named Export)
import { fetchOwnerTodayAttendanceLogs } from "@/modules/attendanceC/attendanceApi";

// ✅ storeId 가져오기 (너 프로젝트에 StoreContext가 있으니 이게 가장 자연스러움)
import { useStore } from "@/contexts/StoreContext";

type WorkStatus = "WORKING" | "OFF";

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
    map[id] = last?.recordType === "IN" ? "WORKING" : "OFF";
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

  const { currentStoreId } = useStore(); // ✅ 현재 선택된 사업장

  const [workStatusMap, setWorkStatusMap] = useState<Record<number, WorkStatus>>({});
  const [workStatusLoading, setWorkStatusLoading] = useState(false);

  // 직원 id 목록(의존성 최적화)
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
          logs: logs as any, // OwnerAttendanceLogItem이 동일 구조라면 OK
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

  const StatusDot = ({ status }: { status: WorkStatus }) => (
    <span
      className={
        "inline-block h-2.5 w-2.5 rounded-full " +
        (status === "WORKING" ? "bg-green-500" : "bg-slate-300")
      }
      title={status === "WORKING" ? "근무중" : "비근무"}
    />
  );

  return (
    <div className="space-y-6">
      {banner && (
        <div
          className={`p-3 text-sm rounded border ${banner.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
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
                <span className="ml-2 inline-flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    근무중
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    퇴근
                  </span>
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
                {filtered.map((e, idx) => {
                  const status = workStatusMap[e.employeeId] ?? "OFF";
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
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                              근무중
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>{e.email || "-"}</TableCell>
                      <TableCell>{e.phone || "-"}</TableCell>
                      <TableCell>{e.provider ? <Badge variant="secondary">{e.provider}</Badge> : "-"}</TableCell>
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

                {filtered.length === 0 && (
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