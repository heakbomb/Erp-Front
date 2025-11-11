// features/document/hooks/useDocuments.ts
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../../contexts/StoreContext";
import {
  getDocuments,
  createDocument,
  downloadDocument,
} from "../documentService";
import type { EmployeeDocument } from "../../../lib/types/database";

// react-hook-form에서 사용할 폼 타입
export type DocumentFormValues = {
  docType: string;
  retentionEndDate: string; 
  file: FileList;
};

export function useDocuments() {
  const { currentStoreId } = useStore();
  const queryClient = useQueryClient();

  // ⭐️ 1. 기존 상태들 (페이지네이션, 탭, 검색)
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [currentTab, setCurrentTab] = useState("ACTIVE");
  const [searchQuery, setSearchQuery] = useState(""); // ⭐️ Input용
  const [submittedSearch, setSubmittedSearch] = useState(""); // ⭐️ API 호출용

  // ⭐️ 2. 모달 상태
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // ⭐️ 다운로드 로딩 상태

  // ⭐️ 3. API 요청 파라미터 객체화
  const queryParams = {
    storeId: currentStoreId!,
    page: currentPage,
    size: pageSize,
    status: currentTab,
    search: submittedSearch,
  };

  // ⭐️ 4. (Query) 문서 목록 조회
  const {
    data: documentData,
    isLoading: isDocumentsLoading,
    error: documentsError,
  } = useQuery({
    queryKey: ["documents", queryParams], // ⭐️ 모든 파라미터가 Key가 됨
    queryFn: () => getDocuments(queryParams),
    enabled: !!currentStoreId,
  });

  // ⭐️ 5. (Mutation) 문서 업로드
  const createMutation = useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      setIsUploadModalOpen(false);
      // ⭐️ 업로드 성공 시 기존 로직 (1페이지로 이동, 탭 변경)
      if (currentTab === "EXPIRED") {
        setCurrentTab("ACTIVE"); // ⭐️ 탭 변경이 queryKey를 바꿔서 자동 refetch
      } else {
        queryClient.invalidateQueries({ queryKey: ["documents"] });
      }
      // ⭐️ 페이지는 탭 변경 시 자동으로 0이 됨 (handleTabChange 로직)
      if (currentPage !== 0) {
          setCurrentPage(0);
      }
    },
    onError: (error) => alert(error.message),
  });

  // ⭐️ 6. 이벤트 핸들러: 생성 (FormData 변환)
  const handleUpload = (values: DocumentFormValues) => {
    if (!currentStoreId || values.file.length === 0) return;

    const formData = new FormData();
    formData.append("file", values.file[0]);
    formData.append("storeId", String(currentStoreId));
    formData.append("docType", values.docType);
    formData.append("retentionEndDate", values.retentionEndDate);

    createMutation.mutate(formData);
  };
  
  // ⭐️ 7. 이벤트 핸들러: 다운로드 (기존 로직)
  const handleDownload = async (documentId: number, originalFilename: string) => {
    setIsDownloading(true);
    try {
      const response = await downloadDocument(documentId);

      // (성공 시 다운로드 로직)
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      // (오류 처리 로직 - Blob 파싱)
      let errorMessage = "다운로드 실패";
      if (err.response && err.response.data instanceof Blob) {
        try {
          const errorText = await err.response.data.text();
          errorMessage = errorText; 
        } catch (readError) {
          errorMessage = "오류 메시지를 읽는 데 실패했습니다.";
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      alert(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  // ⭐️ 8. 이벤트 핸들러: 탭, 검색, 페이지 변경
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    setCurrentPage(0); // ⭐️ 1페이지 초기화
    setSearchQuery(""); // ⭐️ 검색어 초기화
    setSubmittedSearch(""); // ⭐️ 검색어 초기화
  };
  
  const handleSearch = () => {
    setSubmittedSearch(searchQuery);
    setCurrentPage(0); // ⭐️ 1페이지 초기화
  };

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < (documentData?.totalPages ?? 0)) {
        setCurrentPage(page);
    }
  };
  
  const openUploadModal = () => setIsUploadModalOpen(true);

  // ⭐️ 9. Page 컴포넌트에 반환
  return {
    documentData,
    isDocumentsLoading,
    documentsError,
    
    currentPage,
    totalPages: documentData?.totalPages ?? 0,
    totalDocuments: documentData?.totalElements ?? 0,
    handlePageChange,
    
    currentTab,
    handleTabChange,
    
    searchQuery,
    setSearchQuery,
    handleSearch,

    isUploadModalOpen,
    setIsUploadModalOpen,
    openUploadModal,
    handleUpload,
    isUploading: createMutation.isPending,
    
    handleDownload,
    isDownloading,
  };
}