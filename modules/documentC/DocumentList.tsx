// src/modules/document/DocumentList.tsx
"use client";

import { useDocuments } from "./useDocuments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Upload, Search, Download, FileText, Loader2, File } from "lucide-react"; 
import DocumentUploadModal from "./DocumentUploadModal";

export default function DocumentList() {
  const {
    documentData, isDocumentsLoading,
    currentPage, totalPages, totalDocuments, handlePageChange,
    currentTab, handleTabChange,
    searchQuery, setSearchQuery, handleSearch,
    isUploadModalOpen, setIsUploadModalOpen, openUploadModal,
    handleUpload, isUploading,
    handleDownload, isDownloading,
  } = useDocuments();

  const items = documentData?.content ?? [];
  
  // 클라이언트 측 상태 표시 (API 필터링과 별개로 시각적 강조)
  const getStatusBadge = (endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    
    if (end < today) {
      return <Badge variant="destructive">만료됨</Badge>;
    }
    // 만료 7일 전 경고
    const warningDate = new Date();
    warningDate.setDate(today.getDate() + 7);
    if (end <= warningDate) {
      return <Badge variant="outline" className="text-orange-500 border-orange-500">만료 임박</Badge>;
    }
    return <Badge variant="secondary">보관중</Badge>;
  };

  const TableContent = (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>문서 목록</CardTitle>
            <CardDescription>
              {currentTab === "ALL" ? "전체" : currentTab === "ACTIVE" ? "보관중인" : "만료된"} 문서 {totalDocuments}개
            </CardDescription>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Input 
              placeholder="파일명 또는 유형 검색..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="md:w-64"
            />
            <Button onClick={handleSearch} size="icon" variant="secondary"><Search className="h-4 w-4" /></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isDocumentsLoading ? (
          <div className="flex justify-center items-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
            <File className="h-10 w-10 mb-2 opacity-20" />
            <p>등록된 문서가 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>문서 유형</TableHead>
                    <TableHead>파일명</TableHead>
                    <TableHead>보관 만료일</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((doc) => (
                    <TableRow key={doc.documentId}>
                      <TableCell className="font-medium">{doc.docType}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{doc.originalFilename}</TableCell>
                      <TableCell>{doc.retentionEndDate}</TableCell>
                      <TableCell>{getStatusBadge(doc.retentionEndDate)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDownload(doc.documentId, doc.originalFilename)} 
                          disabled={isDownloading}
                        >
                          <Download className="h-4 w-4 mr-1" /> 다운로드
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 0 && (
              <div className="flex justify-center gap-2 mt-4 items-center">
                <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => handlePageChange(currentPage - 1)}>
                  이전
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  {currentPage + 1} / {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={currentPage >= totalPages - 1} onClick={() => handlePageChange(currentPage + 1)}>
                  다음
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">문서 관리</h1>
          <p className="text-muted-foreground mt-1">
            근로계약서, 보건증 등 중요 문서를 안전하게 보관하고 관리합니다.
          </p>
        </div>
        <Button onClick={openUploadModal} className="shadow-sm">
          <Upload className="mr-2 h-4 w-4" /> 문서 업로드
        </Button>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="ACTIVE" className="w-24">보관중</TabsTrigger>
          <TabsTrigger value="EXPIRED" className="w-24">만료됨</TabsTrigger>
          <TabsTrigger value="ALL" className="w-24">전체</TabsTrigger>
        </TabsList>
        <TabsContent value="ACTIVE" className="space-y-4">{TableContent}</TabsContent>
        <TabsContent value="EXPIRED" className="space-y-4">{TableContent}</TabsContent>
        <TabsContent value="ALL" className="space-y-4">{TableContent}</TabsContent>
      </Tabs>

      <DocumentUploadModal 
        open={isUploadModalOpen} 
        onOpenChange={setIsUploadModalOpen} 
        onSubmit={handleUpload} 
        isPending={isUploading} 
      />
    </div>
  );
}