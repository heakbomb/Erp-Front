// modules/employeeC/EmployeePendingList.tsx
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { CheckCircle2, XCircle, Clock3 } from "lucide-react";
import useEmployeePending from "./useEmployeePending";

function normalizeStatus(raw?: string) {
  const s = (raw ?? "PENDING").toUpperCase();
  if (s === "APPROVED") return "APPROVED";
  if (s === "REJECTED") return "REJECTED";
  return "PENDING";
}

function StatusBadge({ status }: { status: "PENDING" | "APPROVED" | "REJECTED" }) {
  if (status === "APPROVED") {
    return (
      <Badge className="bg-green-100 text-green-700 border border-green-200">
        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
        승인
      </Badge>
    );
  }
  if (status === "REJECTED") {
    return (
      <Badge className="bg-red-100 text-red-700 border border-red-200">
        <XCircle className="mr-1 h-3.5 w-3.5" />
        거절
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="border">
      <Clock3 className="mr-1 h-3.5 w-3.5" />
      신청
    </Badge>
  );
}

export default function EmployeePendingList() {
  const {
    pending,
    loadingPending,
    storeIdForPending,
    setStoreIdForPending,
    fetchPending,
    approve,
    reject,
    banner,
  } = useEmployeePending();

  const cards = useMemo(() => {
    return (pending ?? []).map((r) => {
      const status = normalizeStatus((r as any).status);

      // ✅ 백엔드에서 내려주는 필드 우선 사용 (호환: 기존 name/phone도 fallback)
      const employeeName =
        (r as any).employeeName ?? (r as any).name ?? (r as any).employee_name ?? `EMP#${(r as any).employeeId}`;
      const employeePhone =
        (r as any).employeePhone ?? (r as any).phone ?? (r as any).employee_phone ?? "-";

      return {
        ...r,
        _status: status as "PENDING" | "APPROVED" | "REJECTED",
        _employeeName: employeeName,
        _employeePhone: employeePhone,
      };
    });
  }, [pending]);

  return (
    <div className="space-y-6">
      {banner && (
        <div
          className={`p-3 text-sm rounded border ${
            banner.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {banner.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>신청 직원 목록</CardTitle>
          <CardDescription>사업장 ID로 조회하면 신청/승인/거절 상태를 카드로 확인할 수 있습니다.</CardDescription>

          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <Input
              className="w-44"
              placeholder="사업장 ID"
              value={storeIdForPending}
              onChange={(e) => setStoreIdForPending(e.target.value.replace(/[^0-9]/g, ""))}
            />
            <Button onClick={() => fetchPending()}>조회</Button>

            <Badge variant="secondary" className="border">
              {loadingPending ? "조회 중..." : `결과 ${cards.length}`}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {loadingPending ? (
            <div className="text-sm">로딩 중...</div>
          ) : cards.length === 0 ? (
            <div className="text-sm text-muted-foreground">대기 내역 없음</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {cards.map((r: any) => (
                <div key={r.assignmentId} className="rounded-lg border bg-background p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {/* ✅ 이름 표시 */}
                        <p className="font-medium truncate">{r._employeeName}</p>
                        <StatusBadge status={r._status} />
                      </div>

                      {/* ✅ 이메일 표시(기존 그대로 유지) */}
                      <p className="text-xs text-muted-foreground mt-1 truncate">{r.email || "-"}</p>

                      {/* ✅ 전화번호 표시 (백엔드 필드 우선) */}
                      <p className="text-xs text-muted-foreground truncate">{r._employeePhone}</p>
                    </div>

                    {/* ✅ 승인/거절은 대기일 때만 */}
                    {r._status === "PENDING" && (
                      <div className="flex shrink-0 gap-2">
                        <Button size="sm" onClick={() => approve(r.assignmentId)}>
                          승인
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => reject(r.assignmentId)}>
                          거절
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    {r._status === "PENDING" && "승인 또는 거절을 선택하세요."}
                    {r._status === "APPROVED" && "이미 승인된 요청입니다."}
                    {r._status === "REJECTED" && "이미 거절된 요청입니다."}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}