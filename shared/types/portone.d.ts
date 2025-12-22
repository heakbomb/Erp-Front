

export {};

declare global {
  interface Window {
    PortOne: {
      requestIssueBillingKey: (options: BillingKeyRequest) => Promise<BillingKeyResponse>;
      requestPayment: (options: PaymentRequest) => Promise<PaymentResponse>;
    };
  }
}

export interface BillingKeyRequest {
  storeId: string;
  channelKey: string;
  issueId: string; // ✅ [수정됨] billingKeyPaymentId -> issueId
  issueName: string;
  billingKeyMethod: "CARD" | "EASY_PAY";
  redirectUrl?: string;
  customer?: {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    identityNumber?: string;
  };
  windowType?: {
    pc?: 'IFRAME' | 'POPUP';
    mobile?: 'IFRAME' | 'POPUP' | 'REDIRECTION';
  };
}

export interface BillingKeyResponse {
  code?: string;
  message?: string;
  billingKey?: string;
  issueId?: string;
  txId?: string;
}

export interface PaymentRequest {
  storeId: string;
  channelKey: string;
  paymentId: string;
  orderName: string;
  totalAmount: number;
  currency: string;
  payMethod: string;
  customer?: any;
}

export interface PaymentResponse {
  code?: string;
  message?: string;
  paymentId?: string;
  transactionId?: string;
}