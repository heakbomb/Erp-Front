import { apiClient } from "./client";
import type { EmployeeDocument } from "../types/database"; // ⬅️ 경로 수정
import type { PageResponse } from "../types/api"; // ⬅️ 경로 수정

type DocumentParams = {
  page: number;
  size: number;
  status: "ACTIVE" | "EXPIRED" | "ALL";
  search: string;
};

/**
 * (사장) 사업장의 문서 목록 조회 (페이징)
 *
 */
export const getDocuments = async (
  storeId: number,
  params: DocumentParams
) => {
  const res = await apiClient.get<PageResponse<EmployeeDocument>>(
    `/api/hr/documents/store/${storeId}`,
    { params }
  );
  return res.data;
};

/**
 * (사장) 문서 업로드
 *
 */
export const uploadDocument = async (formData: FormData) => {
  // FormData는 Content-Type을 'multipart/form-data'로 자동 설정
  const res = await apiClient.post("/api/hr/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

/**
 * (사장) 문서 다운로드
 *
 */
export const downloadDocument = async (documentId: number) => {
  const res = await apiClient.get(`/api/hr/documents/download/${documentId}`, {
    responseType: "blob", // 파일 다운로드를 위해 blob으로 응답 받기
  });
  return res.data;
};