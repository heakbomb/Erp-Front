// modules/dashboardC/dashboardTypes.ts

/* --- 관리자 (Admin) --- */
export type AuditLog = {
  auditId: number;
  userId: number;
  userType: string;
  actionType: string;
  targetTable: string;
  createdAt: string;
};

export type AdminDashboardStats = {
  totalStores: number;
  totalUsers: number;
  activeSubscriptions: number;
  pendingStoreCount: number;
  pendingInquiryCount: number;
  recentActivities: AuditLog[];
};

/* --- 사장님 (Owner) --- */
export interface EmployeeStatusSummary {
  workingCount: number;
  totalCount: number;
}

export type OwnerDashboardStats = {
  todaySales: number;
  todaySalesChange: number;
  monthSales: number;
  monthSalesChange: number;
  lowStockCount: number;
  workingEmployees: number;
  totalEmployees: number;
};

export type OwnerAlertSeverity = "info" | "medium" | "high";

export type OwnerAlert = {
  id: string;
  title: string;
  description: string;
  severity: OwnerAlertSeverity;
};

export type QuickAction = {
  id: string;
  title: string;
  description: string;
};

export type AiInsight = {
  id: string;
  title: string;
  description: string;
};

export type OwnerDashboardData = {
  stats: OwnerDashboardStats;
  alerts: OwnerAlert[];
  quickActions: QuickAction[];
  aiInsights: AiInsight[];
};

/* --- 직원 (Employee) --- */
export type WorkRecord = {
  date: string;
  start: string;
  end: string;
  hours: string;
};

export type QuickStats = {
  todayWorkTime: string;
  todayStartTime: string;
  monthWorkDays: string;
  monthWorkHours: string;
  expectedSalary: string;
  hourlyWage: string;
  workStatus: string;
  expectedLeaveTime: string;
};

export type EmployeeDashboardData = {
  currentWorkplace: string;
  quickStats: QuickStats;
  recentRecords: WorkRecord[];
};