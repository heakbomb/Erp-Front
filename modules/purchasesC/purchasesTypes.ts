// modules/purchasesC/purchasesTypes.ts
import { Inventory, InventoryStatus } from "../inventoryC/inventoryTypes";

// API 응답 타입 (features/purchases/purchasesService.ts 참조)
export interface PurchaseHistoryResponse {
  purchaseId: number;
  storeId: number;
  itemId: number;
  itemName: string;         // 조인된 품목명
  itemUnit: string;         // 조인된 단위 (Inventory.stockType)
  purchaseDate: string;     // YYYY-MM-DD
  purchaseQty: number;      // quantity -> purchaseQty (features 기준)
  unitPrice: number;
  totalPrice: number;       // 계산된 총액
  supplierName?: string;    // features DTO에는 supplierName이 없을 수 있음 (확인 필요), features 코드에는 없음. API 응답에는 없을 수도 있지만 일단 유지하거나 features 따름.
                            // features의 PurchaseHistoryResponse는 PurchaseHistory 타입을 확장함.
                            // shared/types/database를 볼 수 없으므로 features 코드를 신뢰.
                            // features PurchaseModal에는 supplierName 필드가 없음. 따라서 제거.
}

// 재고 옵션 타입
export interface InventoryOption extends Inventory {
  avgUnitCost?: number;
  lastUnitCost?: number;
}

// 매입 생성 요청
export interface CreatePurchaseBody {
  storeId: number;
  itemId: number;
  purchaseQty: number;
  unitPrice: number;
  purchaseDate: string;
}

// 매입 수정 요청
export interface UpdatePurchaseBody {
  storeId: number;
  purchaseQty?: number;
  unitPrice?: number;
  purchaseDate?: string;
}

// 새 품목 생성 요청 (매입 모달에서 사용)
export interface CreateInventoryBody {
  storeId: number;
  itemName: string;
  itemType: string;
  stockType: string;
  stockQty?: number;
  safetyQty?: number;
  status?: InventoryStatus;
}

// 검색 파라미터
export interface PurchaseParams {
  storeId: number;
  page: number;
  size: number;
  sort: string;
  itemId?: number;
  from?: string;
  to?: string;
}