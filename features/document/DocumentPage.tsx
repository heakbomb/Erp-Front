// features/document/DocumentPage.tsx
"use client"

import React, { useState } from "react";
// ⭐️ shadcn/ui 컴포넌트 임포트 (경로 수정)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/ui/pagination";
import { Upload, Search, Download, FileText, Loader2 } from "lucide-react"; 

// ⭐️ 훅 및 모달 컴포넌트 임포트
import { useDocuments } from "./hooks/useDocuments";
import { DocumentUploadModal } from "./components/DocumentUploadModal";

export default function DocumentPageFeature() {
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => { setMounted(true) }, []);

  // ⭐️ 1. 훅 호출 (모든 로직을 여기서 받아옴)
  const {
    documentData,
    isDocumentsLoading,
    documentsError,
    currentPage,
    totalPages,
    totalDocuments,
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
    isUploading,
    handleDownload,
    isDownloading,
  } = useDocuments();

  const items = documentData?.content ?? [];
  const error = documentsError as Error | null;
  
  // ⭐️ 오늘 날짜와 비교 (기존 로직)
  const getStatus = (endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isExpired = new Date(endDate) < today;
    return isExpired ? "만료" : "보관중";
  };
  
  // ⭐️ 2. 공통 테이블 컨텐츠 (기존 로직)
  const DocumentTableContent = (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>문서 목록</CardTitle>
            <CardDescription>
              총 {totalDocuments}개의 문서가 조회되었습니다
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="파일명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              className="w-64"
            />
            <Button onClick={handleSearch}><Search className="h-4 w-4" /></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isDocumentsLoading && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
        {error && <div className="text-red-500 text-center p-4">{error.message}</div>}
        
        {!isDocumentsLoading && !error && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>파일명</TableHead>
                  <TableHead>문서 유형</TableHead>
                  <TableHead>보관 만료일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length > 0 ? (
                  items.map((doc) => {
                    const status = getStatus(doc.retentionEndDate)
                    return (
                      <TableRow key={doc.documentId}>
                        <TableCell className="font-medium">{doc.originalFilename}</TableCell>
                        <TableCell>{doc.docType}</TableCell>
                        <TableCell>{doc.retentionEndDate}</TableCell>
                        <TableCell>
                          <Badge variant={status === "만료" ? "destructive" : "secondary"}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDownload(doc.documentId, doc.originalFilename)}
                            disabled={isDownloading} // ⭐️ 다운로드 중 비활성화
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      문서가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination UI */}
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                    className={!isDocumentsLoading && currentPage > 0 ? "" : "pointer-events-none opacity-50"}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4 py-2 text-sm">
                    Page {totalPages > 0 ? currentPage + 1 : 0} of {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                    className={!isDocumentsLoading && currentPage < totalPages - 1 ? "" : "pointer-events-none opacity-50"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* --- 1. 페이지 헤더 및 업로드 버튼 --- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">문서 관리</h1>
          <p className="text-muted-foreground">사업장의 인사 문서를 업로드하고 관리하세요</p>
        </div>
        
        {mounted && (
          <Button onClick={openUploadModal}><Upload className="mr-2 h-4 w-4" />문서 업로드</Button>
        )}
      </div>

      {/* --- 2. 탭 및 문서 목록 --- */}
      <Tabs value={currentTab} className="space-y-4" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="ACTIVE">
            <FileText className="mr-2 h-4 w-4" /> 보관중
          </TabsTrigger>
          <TabsTrigger value="EXPIRED">
            <FileText className="mr-2 h-4 w-4" /> 만료
          </TabsTrigger>
          <TabsTrigger value="ALL">
            <FileText className="mr-2 h-4 w-4" /> 전체 문서
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ACTIVE">{DocumentTableContent}</TabsContent>
        <TabsContent value="EXPIRED">{DocumentTableContent}</TabsContent>
        <TabsContent value="ALL">{DocumentTableContent}</TabsContent>
      </Tabs>
      
      {/* --- 3. 모달 렌더링 --- */}
      {mounted && (
        <DocumentUploadModal
          open={isUploadModalOpen}
          onOpenChange={setIsUploadModalOpen}
          onSubmit={handleUpload}
          isPending={isUploading}
        />
      )}
    </div>
  )
}