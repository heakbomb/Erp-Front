// src/modules/employee/EmployeeQrScanner.tsx
"use client";

import { useStore } from "@/contexts/StoreContext";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { ExternalLink, Store, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function EmployeeQrScanner() {
  const { currentStoreId } = useStore();

  if (!currentStoreId) {
    return <div className="text-center p-4">매장을 선택해주세요.</div>;
  }

  return (
    <Card className="max-w-md mx-auto text-center border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          출퇴근 키오스크
        </CardTitle>
        <CardDescription>
          직원들의 출퇴근 체크를 위한 전용 화면을 실행합니다.<br/>
          매장에 비치된 태블릿이나 PC에서 실행해주세요.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="p-6 bg-slate-50 rounded-xl space-y-4">
          <Store className="h-16 w-16 mx-auto text-slate-300" />
          <div className="text-sm text-muted-foreground">
            <p>보안을 위해 1분마다 갱신되는 <strong>동적 QR 코드</strong>를 사용합니다.</p>
            <p className="mt-1">정적(인쇄된) QR 코드는 사용할 수 없습니다.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-muted rounded-lg">
            <span className="text-xs text-muted-foreground block mb-1">현재 사업장 코드</span>
            <span className="text-2xl font-mono font-bold tracking-widest">{currentStoreId}</span>
          </div>

          <Button asChild className="w-full h-12 text-lg" size="lg">
            {/* AttendanceDesktop 페이지로 이동하며 storeCode 전달 */}
            <Link href={`/attendance/desktop?storeCode=${currentStoreId}`} target="_blank">
              <ExternalLink className="mr-2 h-5 w-5" />
              키오스크 모드 실행하기
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            * 새 탭에서 전체 화면으로 열립니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}