// features/owner/payroll/components/PayslipTemplate.tsx
"use client"

import React, { forwardRef } from "react"

type PayslipProps = {
  yearMonth: string          // "2025-12"
  employeeName: string
  department?: string        // 소속(사업장명 등) = 사업장 이름
  basePay: number            // 기본급
  grossPay: number           // 지급 합계 (총 지급액)
  deductions: number         // 공제 총액
  netPay: number             // 실수령액
  workDays: number           // 근무일수
  workHours: number          // 근무시간(시간 단위)
  wageType?: string          // "HOURLY" | "MONTHLY" 등
  deductionType?: string     // "FOUR_INSURANCE" | "TAX_3_3" 등
}

const PayslipTemplate = forwardRef<HTMLDivElement, PayslipProps>((props, ref) => {
  const {
    yearMonth,
    employeeName,
    department,
    basePay,
    grossPay,
    deductions,
    netPay,
    workDays,
    workHours,
    wageType,
    deductionType,
  } = props

  // "2025-12" -> "2025년 12월"
  const monthText = yearMonth.replace("-", "년 ") + "월"

  // 👉 시급제/월급제 표시 (OwnerPayrollView 와 동일)
  const wageTypeLabel =
    wageType === "HOURLY"
      ? "기본급여(시급제)"
      : wageType === "MONTHLY"
        ? "기본급여(월급제)"
        : "기본급여"

  // 👉 공제 유형 라벨
  const deductionLabel =
    deductionType === "FOUR_INSURANCE"
      ? "공제 합계 (4대 보험)"
      : deductionType === "TAX_3_3"
        ? "공제 합계 (3.3% 공제)"
        : "공제 합계"

  return (
    <div
      ref={ref}
      style={{
        width: "800px",
        padding: "40px 48px",
        fontSize: "13px",
        fontFamily: "sans-serif",
        border: "1px solid #000",
      }}
    >
      {/* 0. 제목 + 해당 월 명시 */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 700,
            letterSpacing: "0.3em",
            marginBottom: "8px",
          }}
        >
          {monthText} 급여지급명세서
        </h1>
      </div>

      {/* 소속 / 성명 (왼쪽 정렬) */}
      <div
        style={{
          marginBottom: "24px",
          fontSize: "13px",
          lineHeight: 1.8,
        }}
      >
        <div>소속: {department ?? ""}</div>
        <div>성명: {employeeName}</div>
      </div>

      {/* 1. 실 지급액 */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ marginBottom: "6px", fontWeight: 600 }}>1. 실 지급액</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                지급 합계
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                공제 합계
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                실 수령액
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                ₩{grossPay.toLocaleString()}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                ₩{deductions.toLocaleString()}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                  fontWeight: 600,
                }}
              >
                ₩{netPay.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. 지급 내역 */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ marginBottom: "6px", fontWeight: 600 }}>2. 지급 내역</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                지급항목
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                금액
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                공제항목
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                금액
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                {wageTypeLabel}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                ₩{basePay.toLocaleString()}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                {deductionLabel}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                ₩{deductions.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. 근무 정보 */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ marginBottom: "6px", fontWeight: 600 }}>3. 근무 정보</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                근무 일수
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                {workDays}일
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                근무 시간
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                {workHours.toFixed(1)}시간
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 하단 날짜 없음 (요청사항) */}
    </div>
  )
})

PayslipTemplate.displayName = "PayslipTemplate"

export default PayslipTemplate