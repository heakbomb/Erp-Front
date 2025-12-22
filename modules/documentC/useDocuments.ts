// src/modules/document/useDocuments.ts
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext"; // AuthContext 추가
import { documentApi } from "./documentApi";
import type { DocumentFormValues } from "./documentTypes";
import { useToast } from "@/shared/ui/use-toast";

export function useDocuments() {
  const { currentStoreId } = useStore();
  const { user } = useAuth(); // 로그인 체크용
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 상태 관리
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [currentTab, setCurrentTab] = useState<"ACTIVE" | "EXPIRED" | "ALL">("ACTIVE");
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // 1. 목록 조회
  const {
    data: documentData,
    isLoading: isDocumentsLoading,
    error: documentsError,
  } = useQuery({
    queryKey: ["documents", currentStoreId, currentPage, currentTab, submittedSearch],
    queryFn: () => {
      if (!currentStoreId) throw new Error("매장이 선택되지 않았습니다.");
      return documentApi.getDocuments(currentStoreId, {
        page: currentPage,
        size: pageSize,
        status: currentTab,
        search: submittedSearch,
      });
    },
    enabled: !!currentStoreId && !!user, // 로그인 및 매장 선택 시에만 활성화
  });

  // 2. 업로드 Mutation
  const createMutation = useMutation({
    mutationFn: (formData: FormData) => {
      if (!currentStoreId) throw new Error("매장이 선택되지 않았습니다.");
      return documentApi.uploadDocument(currentStoreId, formData);
    },
    onSuccess: () => {
      setIsUploadModalOpen(false);
      toast({ title: "업로드 성공", description: "문서가 안전하게 저장되었습니다." });
      
      // 만료 탭에 있었다면 활성 탭으로 이동 (보통 활성 문서를 올리므로)
      if (currentTab === "EXPIRED") setCurrentTab("ACTIVE");
      
      // 쿼리 갱신
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setCurrentPage(0);
    },
    onError: (error: any) => {
      toast({ 
        variant: "destructive", 
        title: "업로드 실패", 
        description: error.response?.data?.message || "문서 업로드 중 오류가 발생했습니다." 
      });
    },
  });

  // 핸들러: 업로드 폼 제출
  const handleUpload = (values: DocumentFormValues) => {
    if (!currentStoreId || values.file.length === 0) return;

    const formData = new FormData();
    // API 명세에 맞춰 필드 구성
    formData.append("file", values.file[0]); 
    formData.append("docType", values.docType);
    formData.append("retentionEndDate", values.retentionEndDate);
    // storeId는 URL로 전달하므로 FormData에는 제외 (백엔드 요구사항에 따라 추가 가능)

    createMutation.mutate(formData);
  };

  // 핸들러: 다운로드
  const handleDownload = async (documentId: number, originalFilename: string) => {
    if (!currentStoreId) return;
    setIsDownloading(true);
    try {
      const response = await documentApi.downloadDocument(currentStoreId, documentId);
      
      // Blob URL 생성 및 다운로드 트리거
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", originalFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "다운로드 실패", 
        description: "파일을 다운로드할 수 없습니다." 
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // 핸들러: 탭 변경
  const handleTabChange = (value: string) => {
    setCurrentTab(value as any);
    setCurrentPage(0);
    setSearchQuery("");
    setSubmittedSearch("");
  };

  // 핸들러: 검색
  const handleSearch = () => {
    setSubmittedSearch(searchQuery);
    setCurrentPage(0);
  };

  // 핸들러: 페이지 변경
  const handlePageChange = (page: number) => {
    if (page >= 0 && page < (documentData?.totalPages ?? 0)) {
      setCurrentPage(page);
    }
  };

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
    openUploadModal: () => setIsUploadModalOpen(true),
    handleUpload,
    isUploading: createMutation.isPending,
    
    handleDownload,
    isDownloading,
  };
}