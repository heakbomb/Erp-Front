"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { documentApi } from "./documentApi";
import type { DocumentFormValues } from "./documentTypes";
import { useToast } from "@/shared/ui/use-toast";
import { useSearch } from "@/shared/hooks/useSearch";
import { usePagination } from "@/shared/hooks/usePagination";

export function useDocuments() {
  const { currentStoreId } = useStore();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [currentTab, setCurrentTab] = useState<"ACTIVE" | "EXPIRED" | "ALL">("ACTIVE");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const pagination = usePagination();
  const search = useSearch({
    onSearch: () => pagination.resetPage(),
  });

  const { data: documentData, isLoading: isDocumentsLoading, error: documentsError } = useQuery({
    queryKey: ["documents", currentStoreId, pagination.page, currentTab, search.activeKeyword],
    queryFn: () => {
      if (!currentStoreId) throw new Error("매장이 선택되지 않았습니다.");
      return documentApi.getDocuments(currentStoreId, {
        page: pagination.page,
        size: pagination.size,
        status: currentTab,
        search: search.activeKeyword,
      });
    },
    enabled: !!currentStoreId && !!user,
  });

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => documentApi.uploadDocument(currentStoreId!, formData),
    onSuccess: () => {
      setIsUploadModalOpen(false);
      toast({ title: "업로드 성공" });
      if (currentTab === "EXPIRED") setCurrentTab("ACTIVE");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      pagination.resetPage();
    },
    onError: (error: any) => toast({ variant: "destructive", title: "업로드 실패", description: error.message }),
  });

  const handleUpload = (values: DocumentFormValues) => {
    if (!currentStoreId || values.file.length === 0) return;
    const formData = new FormData();
    formData.append("file", values.file[0]); 
    formData.append("docType", values.docType);
    formData.append("retentionEndDate", values.retentionEndDate);
    createMutation.mutate(formData);
  };

  const handleDownload = async (documentId: number, originalFilename: string) => {
    if (!currentStoreId) return;
    setIsDownloading(true);
    try {
      const response = await documentApi.downloadDocument(currentStoreId, documentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = originalFilename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ variant: "destructive", title: "다운로드 실패" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setCurrentTab(value as any);
    pagination.resetPage();
  };

  const handlePageChange = (p: number) => {
    if (p >= 0 && p < (documentData?.totalPages ?? 0)) pagination.handlePageChange(p);
  };

  return {
    documentData, isDocumentsLoading, documentsError,
    currentPage: pagination.page,
    totalPages: documentData?.totalPages ?? 0,
    totalDocuments: documentData?.totalElements ?? 0,
    handlePageChange,
    currentTab, handleTabChange,
    
    searchQuery: search.keyword,
    setSearchQuery: search.handleChange,
    handleSearch: search.submitSearch,
    handleKeyDown: search.handleKeyDown, // Enter
    
    isUploadModalOpen, setIsUploadModalOpen,
    openUploadModal: () => setIsUploadModalOpen(true),
    handleUpload, isUploading: createMutation.isPending,
    handleDownload, isDownloading,
  };
}