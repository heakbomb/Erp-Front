export type PayrollRecord = {
  month: string
  basePay: number
  bonus: number
  deductions: number
  netPay: number
  status: string
  paidDate: string
}

export type CurrentPayrollSummary = {
  titleMonth: string        // 예: "2024년 4월 (진행중)"
  basePay: string           // "₩1,440,000"
  bonus: string             // "₩0"
  deductions: string        // "-₩50,000"
  netPay: string            // "₩1,390,000"
}

export type EmployeePayrollData = {
  currentWorkplace: string
  currentSummary: CurrentPayrollSummary
  history: PayrollRecord[]
}

// 원래 page.tsx에 있던 하드코딩 데이터를 그대로 옮김
export function getMockEmployeePayrollData(): EmployeePayrollData {
  return {
    currentWorkplace: "김사장님의 카페",
    currentSummary: {
      titleMonth: "2024년 4월 (진행중)",
      basePay: "₩1,440,000",
      bonus: "₩0",
      deductions: "-₩50,000",
      netPay: "₩1,390,000",
    },
    history: [
      {
        month: "2024년 3월",
        basePay: 1440000,
        bonus: 100000,
        deductions: 50000,
        netPay: 1490000,
        status: "지급완료",
        paidDate: "2024-04-05",
      },
      {
        month: "2024년 2월",
        basePay: 1360000,
        bonus: 0,
        deductions: 45000,
        netPay: 1315000,
        status: "지급완료",
        paidDate: "2024-03-05",
      },
      {
        month: "2024년 1월",
        basePay: 1520000,
        bonus: 150000,
        deductions: 55000,
        netPay: 1615000,
        status: "지급완료",
        paidDate: "2024-02-05",
      },
    ],
  }
}