// modules/salesC/salesTypes.ts

// ===== 공통 / 대시보드 =====
export type Period = "DAY" | "WEEK" | "MONTH" | "YEAR";

export interface SalesSummaryResponse {
  todaySales: number;
  yesterdaySales: number;
  thisWeekSales: number;
  lastWeekSales: number;
  thisMonthSales: number;
  lastMonthSales: number;
  avgTicket: number;
  prevAvgTicket: number;
}

export interface DailySalesDatum {
  date: string;
  sales: number;
}

export interface TransactionSummary {
  transactionId: number;
  transactionTime: string; // "2024-01-01T12:00:00" or [2024,1,1,12,0]
  itemsSummary: string;
  totalAmount: number;
  paymentMethod: string;
  status: "PAID" | "CANCELED";
}

// UI 표시용 요약
export interface SalesSummaryUI {
  todaySales: number;
  todayRate: number;
  weekSales: number;
  weekRate: number;
  monthSales: number;
  monthRate: number;
  avgTicket: number;
  avgTicketRate: number;
}

// Top Menu (API 응답 & UI 공용)
export interface TopMenu {
  menuId: number;
  name: string; // 백엔드에서 menuName 또는 name으로 옴
  quantity: number;
  revenue: number;
  share?: number; // UI 계산용
}

export interface ChartData {
  date: string;
  sales: number;
}

// ===== POS =====
export type PaymentMethod = "CARD" | "CASH" | "APP";

export interface PosMenuItem {
  menuId: number;
  menuName: string;
  price: number;
}

export interface CartLine {
  menuId: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
}

export interface PosOrderLine {
  lineId: number;
  menuId: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}

export interface PosOrderResponse {
  transactionId: number;
  storeId: number;
  transactionTime: string;
  totalAmount: number;
  totalDiscount: number;
  paymentMethod: PaymentMethod;
  status: string;
  lines: PosOrderLine[];
}

export interface PosOrderRequest {
  storeId: number;
  idempotencyKey: string;
  paymentMethod: PaymentMethod;
  totalDiscount: number;
  items: {
    menuId: number;
    quantity: number;
    unitPrice: number;
  }[];
}

// ===== 리포트 =====
export interface MonthlySummary {
  lastMonthTotal: number;
  thisMonthTotal: number;
  diff: number;
}

export interface MonthlyTopMenu {
  menuName: string;
  sales: number;
  rate: number;
}

export interface WeeklyPoint {
  weekIndex: number;
  mySales: number;
  areaAvgSales: number;
}

export interface MonthlyReport {
  summary: MonthlySummary;
  topMenus: MonthlyTopMenu[];
  weeklySales: WeeklyPoint[];
}