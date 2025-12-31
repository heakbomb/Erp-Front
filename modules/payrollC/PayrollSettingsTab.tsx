"use client"

import { ChangeEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Skeleton } from "@/shared/ui/skeleton"
import { RefreshCw, Save } from "lucide-react"

import usePayrollSettings from "./usePayrollSettings"
import type { PayrollSetting } from "./payrollTypes"

const DEDUCTION_OPTIONS: Record<
  NonNullable<PayrollSetting["deductionType"]>,
  { label: string; rate: number | null }
> = {
  NONE: { label: "없음", rate: null },
  FOUR_INSURANCE: { label: "4대 보험", rate: 0.09 },
  TAX_3_3: { label: "3.3% 공제", rate: 0.033 },
}

const BASE_WAGE_MAX_INTEGER_DIGITS = 8

// ✅ 2026 최저시급(참고용) - 화면 표시만
const MIN_WAGE_2026_KRW_PER_HOUR: number = 10320

export default function PayrollSettingsTab() {
  const { settings, loading, error, savingEmployeeId, updateSettingField, saveOne, reload } =
    usePayrollSettings()

  const handleBaseWageChange = (employeeId: number, e: ChangeEvent<HTMLInputElement>) => {
    let onlyNumber = e.target.value.replace(/[^0-9]/g, "")
    if (onlyNumber.length > BASE_WAGE_MAX_INTEGER_DIGITS) {
      onlyNumber = onlyNumber.slice(0, BASE_WAGE_MAX_INTEGER_DIGITS)
    }
    const value = onlyNumber ? Number(onlyNumber) : undefined
    updateSettingField(employeeId, { baseWage: value as any })
  }

  const handleWageTypeChange = (employeeId: number, value: string) => {
    updateSettingField(employeeId, { wageType: value as any })
  }

  const handleDeductionChange = (
    employeeId: number,
    value: NonNullable<PayrollSetting["deductionType"]>
  ) => {
    const option = DEDUCTION_OPTIONS[value]
    updateSettingField(employeeId, { deductionType: value, deductionRate: option.rate })
  }

  const handleSaveOne = async (employeeId: number) => {
    const ok = await saveOne(employeeId)
    if (ok) window.alert("급여 설정이 저장되었습니다.")
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

            {/* ✅ 2026 최저시급 안내 (UI는 최소 텍스트만 추가) */}
            <p className="mt-2 text-sm text-muted-foreground">
              2026년 최저시급(참고):{" "}
              <span className="font-medium text-foreground">
                {MIN_WAGE_2026_KRW_PER_HOUR.toLocaleString()}원/시간
              </span>
            </p>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={reload}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" /> 다시 불러오기
          </Button>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : settings.length === 0 ? (
            <p className="text-sm text-muted-foreground">현재 설정된 급여 정보가 없습니다.</p>
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
                {settings.map((s) => {
                  const selectedOption =
                    s.deductionType && DEDUCTION_OPTIONS[s.deductionType]
                      ? DEDUCTION_OPTIONS[s.deductionType]
                      : null

                  return (
                    <TableRow key={s.settingId ?? s.employeeId}>
                      <TableCell className="font-medium">{s.employeeName}</TableCell>
                      <TableCell>{s.role ?? "-"}</TableCell>

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

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Input
                              className="w-[140px]"
                              inputMode="numeric"
                              maxLength={BASE_WAGE_MAX_INTEGER_DIGITS}
                              value={
                                s.baseWage !== null && s.baseWage !== undefined ? String(s.baseWage) : ""
                              }
                              onChange={(e) => handleBaseWageChange(s.employeeId, e)}
                              placeholder="숫자만 입력"
                            />
                            <span className="text-xs text-muted-foreground">
                              원 / {s.wageType === "MONTHLY" ? "월" : "시간"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1 w-[180px]">
                          <Select
                            value={s.deductionType ?? "NONE"}
                            onValueChange={(v) => handleDeductionChange(s.employeeId, v as any)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="공제 없음" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(DEDUCTION_OPTIONS).map(([val, opt]) => (
                                <SelectItem key={val} value={val}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {selectedOption && selectedOption.rate != null && s.deductionType !== "NONE" && (
                            <p className="text-[11px] text-muted-foreground text-left w-full pl-[2px]">
                              {((selectedOption.rate * 100).toFixed(1)).replace(/\.0$/, "")}% 공제
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handleSaveOne(s.employeeId)}
                          disabled={savingEmployeeId === s.employeeId}
                        >
                          <Save className="h-3 w-3" />{" "}
                          {savingEmployeeId === s.employeeId ? "저장 중..." : "저장"}
                        </Button>
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