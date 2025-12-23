"use client";

import { useDocuments } from "./useDocuments";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Card, CardContent } from "@/shared/ui/card";
import { Search, FileText, Download, Upload } from "lucide-react";
import DocumentUploadModal from "./DocumentUploadModal";
import { CommonPagination } from "@/shared/ui/CommonPagination"; // ✅ 추가

export default function DocumentList() {
  const {
    documentData,
    currentTab, handleTabChange,
    searchQuery, setSearchQuery, handleSearch, handleKeyDown,
    currentPage, totalPages, handlePageChange,
    isUploadModalOpen, setIsUploadModalOpen, openUploadModal, handleUpload, isUploading,
    handleDownload, isDownloading
  } = useDocuments();

  const docs = documentData?.content || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <Tabs value={currentTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="ACTIVE">보관 중</TabsTrigger>
              <TabsTrigger value="EXPIRED">만료됨</TabsTrigger>
              <TabsTrigger value="ALL">전체</TabsTrigger>
            </TabsList>
         </Tabs>
         <div className="flex gap-2">
            <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="문서명 검색"
                  className="pl-8"
                  value={searchQuery}
                  onChange={setSearchQuery} 
                  onKeyDown={handleKeyDown}
                />
            </div>
            <Button variant="outline" onClick={handleSearch}>검색</Button>
            <Button onClick={openUploadModal}><Upload className="mr-2 h-4 w-4" /> 업로드</Button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.length === 0 ? <div className="col-span-full text-center py-10 text-muted-foreground">문서가 없습니다.</div> :
            docs.map((doc: any) => (
              <Card key={doc.documentId} className="hover:bg-accent/5 transition-colors">
                <CardContent className="p-4 flex items-start gap-3">
                   <div className="p-2 bg-primary/10 rounded">
                      <FileText className="h-6 w-6 text-primary" />
                   </div>
                   <div className="flex-1 overflow-hidden">
                      <h4 className="font-medium truncate" title={doc.originalFilename}>{doc.originalFilename}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {doc.docType} • {doc.fileSize ? (doc.fileSize / 1024).toFixed(1) + 'KB' : '-'}
                      </p>
                      <p className="text-xs text-muted-foreground">만료: {doc.retentionEndDate}</p>
                   </div>
                   <Button variant="ghost" size="icon" onClick={() => handleDownload(doc.documentId, doc.originalFilename)} disabled={isDownloading}>
                      <Download className="h-4 w-4" />
                   </Button>
                </CardContent>
              </Card>
            ))
          }
      </div>

      {/* ✅ 공통 페이징 컴포넌트 적용 */}
      <CommonPagination 
        page={currentPage} 
        totalPages={totalPages} 
        onPageChange={handlePageChange} 
      />

      <DocumentUploadModal 
        open={isUploadModalOpen} 
        onOpenChange={setIsUploadModalOpen}
        onSubmit={handleUpload}
        // ✅ [수정] isUploading -> isPending
        isPending={isUploading}
      />
    </div>
  );
}