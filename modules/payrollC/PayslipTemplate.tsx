"use client"

import React, { forwardRef } from "react"

type PayslipProps = {
  yearMonth: string
  employeeName: string
  department?: string
  basePay: number
  grossPay: number
  deductions: number
  netPay: number
  workDays: number
  workHours: number
  wageType?: string
  deductionType?: string
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

  const monthText = yearMonth.replace("-", "년 ") + "월"

  const wageTypeLabel =
    wageType === "HOURLY"
      ? "기본급여(시급제)"
      : wageType === "MONTHLY"
        ? "기본급여(월급제)"
        : "기본급여"

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
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "0.3em", marginBottom: "8px" }}>
          {monthText} 급여지급명세서
        </h1>
      </div>

      <div style={{ marginBottom: "24px", fontSize: "13px", lineHeight: 1.8 }}>
        <div>소속: {department ?? ""}</div>
        <div>성명: {employeeName}</div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <div style={{ marginBottom: "6px", fontWeight: 600 }}>1. 실 지급액</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>지급 합계</th>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>공제 합계</th>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>실 수령액</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>₩{grossPay.toLocaleString()}</td>
              <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>₩{deductions.toLocaleString()}</td>
              <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center", fontWeight: 600 }}>₩{netPay.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <div style={{ marginBottom: "6px", fontWeight: 600 }}>2. 지급 내역</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>지급항목</th>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>금액</th>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>공제항목</th>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>금액</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>{wageTypeLabel}</td>
              <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>₩{basePay.toLocaleString()}</td>
              <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>{deductionLabel}</td>
              <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>₩{deductions.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <div style={{ marginBottom: "6px", fontWeight: 600 }}>3. 근무 정보</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>근무 일수</td>
              <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>{workDays}일</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>근무 시간</td>
              <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>{workHours.toFixed(1)}시간</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
})

PayslipTemplate.displayName = "PayslipTemplate"
export default PayslipTemplate