// features/owner/payroll/components/PayrollSettingsTab.tsx
"use client"

import { ChangeEvent } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, Save } from "lucide-react"

import usePayrollSettings from "@/features/owner/payroll/hooks/usePayrollSettings"

export default function PayrollSettingsTab() {
  const {
    settings,
    loading,
    error,
    savingEmployeeId,
    updateSettingField,
    saveOne,
    reload,
  } = usePayrollSettings()

  const handleBaseWageChange = (employeeId: number, e: ChangeEvent<HTMLInputElement>) => {
    const onlyNumber = e.target.value.replace(/[^0-9]/g, "")
    const value = onlyNumber ? Number(onlyNumber) : 0

    updateSettingField(employeeId, { baseWage: value as any })
  }

  const handleWageTypeChange = (employeeId: number, value: string) => {
    updateSettingField(employeeId, { wageType: value as any })
  }

  const handleSaveOne = async (employeeId: number) => {
    await saveOne(employeeId)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>직원별 급여 설정</CardTitle>
            <CardDescription>
              직원별 시급/월급 기준과 기본급을 설정하면, 급여 계산 화면에서 자동으로 반영됩니다.
            </CardDescription>
            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={reload}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" />
            다시 불러오기
          </Button>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : settings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              현재 설정된 급여 정보가 없습니다. 직원 출결/배정이 정상적으로 등록되어 있는지 먼저 확인해주세요.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>직원명</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>급여 형태</TableHead>
                  <TableHead>기본급</TableHead>
                  <TableHead>공제 항목</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.map((s: any) => (
                  <TableRow key={s.settingId ?? s.employeeId}>
                    {/* 직원명 */}
                    <TableCell className="font-medium">
                      {s.employeeName ?? s.name ?? "-"}
                    </TableCell>

                    {/* 역할 */}
                    <TableCell>
                      {s.role ?? "-"}
                    </TableCell>

                    {/* 급여 형태 */}
                    <TableCell>
                      <Select
                        value={s.wageType ?? ""}
                        onValueChange={(v) => handleWageTypeChange(s.employeeId, v)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HOURLY">시급제</SelectItem>
                          <SelectItem value="MONTHLY">월급제</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* 기본급 */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          className="w-[140px]"
                          inputMode="numeric"
                          value={s.baseWage ?? ""}
                          onChange={(e) => handleBaseWageChange(s.employeeId, e)}
                          placeholder="숫자만 입력"
                        />
                        <span className="text-xs text-muted-foreground">
                          원 / {s.wageType === "HOURLY" ? "시간" : "월"}
                        </span>
                      </div>
                    </TableCell>

                    {/* 공제 항목 (지금은 개수만 표시) */}
                    <TableCell>
                      {s.deductionItems && Array.isArray(s.deductionItems) && s.deductionItems.length > 0 ? (
                        <span className="text-xs text-muted-foreground">
                          {s.deductionItems.length}개 항목
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">없음</span>
                      )}
                    </TableCell>

                    {/* 저장 버튼 */}
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleSaveOne(s.employeeId)}
                        disabled={savingEmployeeId === s.employeeId}
                      >
                        <Save className="h-3 w-3" />
                        {savingEmployeeId === s.employeeId ? "저장 중..." : "저장"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}