// src/modules/document/documentTypes.ts

export interface EmployeeDocument {
  documentId: number;
  storeId: number;
  docType: string;         // 문서 유형 (예: 근로계약서)
  originalFilename: string; // 원본 파일명
  retentionEndDate: string; // 보관 만료일 (YYYY-MM-DD)
  // file_path는 보안상 프론트로 전달되지 않을 수 있음
  // contentType 등은 필요 시 추가
}

// 목록 조회 파라미터
export interface DocumentParams {
  page: number;
  size: number;
  status: "ACTIVE" | "EXPIRED" | "ALL";
  search?: string;
}

// 업로드 폼 데이터
export interface DocumentFormValues {
  docType: string;
  retentionEndDate: string;
  file: FileList;
}