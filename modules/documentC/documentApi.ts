// src/modules/document/documentApi.ts
import { apiClient } from "@/shared/api/apiClient";
import type { PageResponse } from "@/shared/types/commonTypes";
import type { EmployeeDocument, DocumentParams } from "./documentTypes";

export const documentApi = {
  // [조회] 매장 문서 목록
  // Path: /store/{storeId}/documents
  getDocuments: async (storeId: number, params: DocumentParams) => {
    const res = await apiClient.get<PageResponse<EmployeeDocument>>(
      `/store/${storeId}/documents`,
      { params }
    );
    return res.data;
  },

  // [업로드] 문서 등록
  // Path: /store/{storeId}/documents
  uploadDocument: async (storeId: number, formData: FormData) => {
    const res = await apiClient.post<EmployeeDocument>(
      `/store/${storeId}/documents`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" }, // 명시적 선언
      }
    );
    return res.data;
  },

  // [다운로드] 문서 다운로드
  // Path: /store/{storeId}/documents/{documentId}/download
  downloadDocument: async (storeId: number, documentId: number) => {
    const res = await apiClient.get(
      `/store/${storeId}/documents/${documentId}/download`,
      { responseType: "blob" } // 파일 바이너리 수신
    );
    return res; 
  },
};