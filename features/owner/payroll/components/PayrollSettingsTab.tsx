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
import type { PayrollSetting } from "@/features/owner/payroll/services/payrollSettingService"

// ✅ 공제 옵션 정의 (레이블 + 기본 비율)
const DEDUCTION_OPTIONS: Record<
  NonNullable<PayrollSetting["deductionType"]>,
  { label: string; rate: number | null }
> = {
  NONE: { label: "없음", rate: null },
  FOUR_INSURANCE: { label: "4대 보험", rate: 0.09 }, // 예시 9%
  TAX_3_3: { label: "3.3% 공제", rate: 0.033 },
}

const BASE_WAGE_MAX_INTEGER_DIGITS = 8


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
    // 1) 숫자만 남기기
    let onlyNumber = e.target.value.replace(/[^0-9]/g, "")

    // 2) 정수부 8자리까지만 허용
    if (onlyNumber.length > BASE_WAGE_MAX_INTEGER_DIGITS) {
      onlyNumber = onlyNumber.slice(0, BASE_WAGE_MAX_INTEGER_DIGITS)
    }

    // 3) 상태 반영 (빈 문자열이면 undefined/빈값 처리)
    const value = onlyNumber ? Number(onlyNumber) : undefined

    updateSettingField(employeeId, { baseWage: value as any })
  }

  const handleWageTypeChange = (employeeId: number, value: string) => {
    updateSettingField(employeeId, { wageType: value as any })
  }

  // ✅ 공제 항목 변경 시 타입 + 비율 동시 갱신
  const handleDeductionChange = (
    employeeId: number,
    value: NonNullable<PayrollSetting["deductionType"]>,
  ) => {
    const option = DEDUCTION_OPTIONS[value]
    updateSettingField(employeeId, {
      deductionType: value,
      deductionRate: option.rate,
    })
  }

  const handleSaveOne = async (employeeId: number) => {
    const ok = await saveOne(employeeId)
    if (ok) {
      window.alert("급여 설정이 저장되었습니다.")
    }
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
                {settings.map((s: PayrollSetting) => {
                  const selectedOption =
                    s.deductionType && DEDUCTION_OPTIONS[s.deductionType]
                      ? DEDUCTION_OPTIONS[s.deductionType]
                      : null

                  return (
                    <TableRow key={s.settingId ?? s.employeeId}>
                      {/* 직원명 */}
                      <TableCell className="font-medium">
                        {s.employeeName ?? (s as any).name ?? "-"}
                      </TableCell>

                      {/* 역할 */}
                      <TableCell>
                        {(s as any).role ?? "-"}
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
                        {(() => {
                          const baseWageStr =
                            s.baseWage !== null && s.baseWage !== undefined ? String(s.baseWage) : ""

                          return (
                            <div className="flex flex-col gap-1">
                              {/* 입력 + 단위 */}
                              <div className="flex items-center gap-2">
                                <Input
                                  className="w-[140px]"
                                  inputMode="numeric"
                                  maxLength={BASE_WAGE_MAX_INTEGER_DIGITS} // 키보드에서도 길이 제한
                                  value={baseWageStr}
                                  onChange={(e) => handleBaseWageChange(s.employeeId, e)}
                                  placeholder="숫자만 입력"
                                />
                                <span className="text-xs text-muted-foreground">
                                  원 / {s.wageType === "MONTHLY" ? "월" : "시간"}
                                </span>
                              </div>

                              {/* ⚠️ 경고 메시지: 최대 자리수 도달 시 표시 */}
                              {baseWageStr.length >= BASE_WAGE_MAX_INTEGER_DIGITS && (
                                <p className="text-[11px] text-red-500">
                                  기본급은 최대 {BASE_WAGE_MAX_INTEGER_DIGITS}자리까지만 입력 가능합니다.
                                </p>
                              )}
                            </div>
                          )
                        })()}
                      </TableCell>

                      {/* ✅ 공제 항목 - 드롭다운과 비율 텍스트 폭/정렬 맞추기 */}
                      <TableCell>
                        {/* 공제 영역 전체를 고정 폭으로 잡고, 안에서 세로 정렬 */}
                        <div className="flex flex-col gap-1 w-[180px]">
                          <Select
                            value={s.deductionType ?? "NONE"}
                            onValueChange={(v) =>
                              handleDeductionChange(
                                s.employeeId,
                                v as NonNullable<PayrollSetting["deductionType"]>,
                              )
                            }
                          >
                            {/* 트리거는 전체 폭 사용 */}
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="공제 없음" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(DEDUCTION_OPTIONS).map(([value, opt]) => (
                                <SelectItem key={value} value={value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {selectedOption &&
                            selectedOption.rate != null &&
                            s.deductionType !== "NONE" && (
                              <p className="text-[11px] text-muted-foreground text-left w-full pl-[2px]">
                                {((selectedOption.rate * 100).toFixed(1)).replace(/\.0$/, "")}
                                % 공제
                              </p>
                            )}
                        </div>
                      </TableCell>

                      {/* 저장 버튼 - 오른쪽 끝 정렬 */}
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => handleSaveOne(s.employeeId)}
                            disabled={savingEmployeeId === s.employeeId}
                          >
                            <Save className="h-3 w-3" />
                            {savingEmployeeId === s.employeeId ? "저장 중..." : "저장"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}