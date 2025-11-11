/**
 * 상세_테이블_정의서.pdf (Table 2.1 ~ 2.23)와
 * 각 페이지 컴포넌트에서 사용된 타입 정의를 기반으로 한
 * 공용 데이터베이스 엔티티 타입입니다.
 */

// 2.1. Owner (사장)
export interface Owner {
  owner_id: number; // BIGINT(20)
  username: string; // VARCHAR(50)
  email: string; // VARCHAR(100)
  created_at: string; // DATETIME
}

// 2.2. Employee (직원)
export interface Employee {
  employeeId: number; // BIGINT(20)
  name: string; // VARCHAR(50)
  email: string; // VARCHAR(100)
  phone: string; // VARCHAR(20)
  provider: string; // VARCHAR(20)
  provider_id: string; // VARCHAR(100)
  createdAt: string; // DATETIME
}

// 2.4. Store (사업장)
export interface Store {
  storeId: number; // BIGINT(20)
  bizId: number; // BIGINT(20)
  storeName: string; // VARCHAR(100)
  industry: string; // VARCHAR(50)
  posVendor: string | null; // VARCHAR(50)
  status: "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "OPERATING"; // VARCHAR(20)
  approvedAt: string | null; // DATETIME
}

// 2.5. BusinessNumber (사업자등록 정보)
export interface BusinessNumber {
  biz_id: number; // BIGINT(20)
  owner_id: number; // BIGINT(20)
  phone: string; // VARCHAR(20)
  biz_num: string; // VARCHAR(10)
  open_status: string | null; // VARCHAR(50)
  tax_type: string | null; // VARCHAR(50)
  certified_at: string | null; // DATETIME
}

// 2.6. EmployeeAssignment (직원/사업장 연결)
export interface EmployeeAssignment {
  assignmentId: number; // BIGINT(20)
  employeeId: number; // BIGINT(20)
  storeId: number; // BIGINT(20)
  role: string; // VARCHAR(50)
  status: "PENDING" | "ACTIVE" | "REJECTED"; // VARCHAR(20)
  // [app/owner/employees/page.tsx]에서 사용된 추가 필드
  name?: string;
  email?: string;
  phone?: string;
  requestedAt?: string;
}

// 2.8. EmployeeDocument (인사 문서)
export interface EmployeeDocument {
  documentId: number; // BIGINT(20)
  storeId: number; // BIGINT(20)
  docType: string; // VARCHAR(50)
  file_path: string; // VARCHAR(255)
  retentionEndDate: string; // DATE
  originalFilename: string; // VARCHAR(255)
  contentType: string; // VARCHAR(100)
}

// 2.10. Inventory (재고 현황)
export interface Inventory {
  itemId: number; // BIGINT(20)
  storeId: number; // BIGINT(20)
  itemName: string; // VARCHAR(100)
  itemType: string; // VARCHAR(20)
  stockType: string; // VARCHAR(20)
  stockQty: number; // DECIMAL(10,3)
  safetyQty: number; // DECIMAL(10,3)
}

// 2.11. MenuItem (판매 메뉴 정의)
export interface MenuItem {
  menuId: number; // BIGINT(20)
  storeId: number; // BIGINT(20)
  menuName: string; // VARCHAR(100)
  price: number; // DECIMAL(10,2)
  calculatedCost: number; // DECIMAL(10,2)
}

// 2.12. RecipeIngredient (메뉴별 레시피)
export interface RecipeIngredient {
  recipeId: number; // BIGINT(20)
  menuId: number; // BIGINT(20)
  itemId: number; // BIGINT(20)
  consumptionQty: number; // DECIMAL(10,3)
}

// 2.13. PurchaseHistory (식자재 매입 기록)
export interface PurchaseHistory {
  purchaseId: number; // BIGINT(20)
  storeId: number; // BIGINT(20)
  itemId: number; // BIGINT(20)
  purchaseQty: number; // DECIMAL(10,3)
  unitPrice: number; // DECIMAL(10,2)
  purchaseDate: string; // DATE
}

// 2.14. SalesTransaction (매출 거래 기록)
export interface SalesTransaction {
  transactionId: number; // BIGINT(20)
  idempotencyKey: string | null; // VARCHAR(100)
  storeId: number; // BIGINT(20)
  menuId: number; // BIGINT(20)
  transactionTime: string; // DATETIME
  salesAmount: number; // DECIMAL(10,2)
}

// 2.16. OwnerSubscription (사용자 구독 상태)
export interface OwnerSubscription {
  ownerSubId: number; // BIGINT(20)
  ownerId: number; // BIGINT(20)
  subId: number; // BIGINT(20)
  startDate: string; // DATE
  expiryDate: string; // DATE
}

// 2.17. DemandForecast (수요 예측 결과)
export interface DemandForecast {
  forecastId: number; // BIGINT(20)
  storeId: number; // BIGINT(20)
  forecastDate: string; // DATE
  predictedSalesMax: number; // DECIMAL(10,2)
  predictedVisitors: number; // INT
}