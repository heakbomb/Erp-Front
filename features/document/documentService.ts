// features/document/documentService.ts
import { apiClient } from "../../lib/api/client";
import type { EmployeeDocument } from "../../lib/types/database"; // ⭐️ database.ts에 타입 정의 필요
import type { PageResponse } from "../../lib/types/api";

// ⭐️ DocumentPage 타입을 API 스펙에 맞게 정의 (기존 코드 참고)
interface DocumentPage extends PageResponse<EmployeeDocument> {
  // totalElements, size, number 등 PageResponse에 이미 있을 수 있음
}

type DocumentParams = {
  storeId: number;
  page: number;
  size: number;
  status: string; // ⭐️ 탭 상태 (ACTIVE, EXPIRED, ALL)
  search: string; // ⭐️ 검색어
};

/**
 * 문서 목록 조회 (페이징, 탭, 검색)
 * ⭐️ API 경로를 기존 코드에 맞게 /api/hr/documents/store/{storeId}로 수정
 */
export const getDocuments = async (params: DocumentParams) => {
  const { storeId, ...rest } = params;
  const res = await apiClient.get<DocumentPage>(
    `/hr/documents/store/${storeId}`, // ⭐️ API 경로 수정
    { params: rest } // storeId는 URL로, 나머지는 쿼리 파라미터로
  );
  return res.data;
};

/**
 * 문서 업로드 (FormData)
 * ⭐️ API 경로를 기존 코드에 맞게 /api/hr/documents/upload로 수정
 */
export const createDocument = async (formData: FormData) => {
  const res = await apiClient.post<EmployeeDocument>(
    "/hr/documents/upload", // ⭐️ API 경로 수정
    formData
    // ⭐️ apiClient가 'multipart/form-data' 헤더를 자동으로 처리
  );
  return res.data;
};

/**
 * 문서 다운로드 (Blob)
 * ⭐️ API 경로를 기존 코드에 맞게 /api/hr/documents/download/{documentId}로 수정
 */
export const downloadDocument = async (documentId: number) => {
  const res = await apiClient.get(
    `/hr/documents/download/${documentId}`, // ⭐️ API 경로 수정
    {
      responseType: 'blob', // ⭐️ Blob으로 응답 받기
    }
  );
  return res; // ⭐️ 전체 응답(data, headers) 반환
};