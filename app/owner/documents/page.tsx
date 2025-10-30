"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Search, Download, FileText, Loader2 } from "lucide-react" 
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// API 응답 데이터 타입
interface Document {
  documentId: number
  originalFilename: string
  docType: string
  retentionEndDate: string // (날짜 문자열)
}

// Spring Page 객체 전체 구조
interface DocumentPage {
  content: Document[]
  totalPages: number
  totalElements: number // 총 문서 개수
  size: number
  number: number // 현재 페이지 번호 (0부터 시작)
}

export default function DocumentManagementPage() {
  
  // --- 상태 관리 ---
  const [searchQuery, setSearchQuery] = useState("") // 사용자가 입력 중인 값
  const [submittedSearch, setSubmittedSearch] = useState("") // API로 보낼 확정된 검색어

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const currentStoreId = 11; // DB에 11번 스토어가 있다고 가정

  // API 데이터 상태
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalDocuments, setTotalDocuments] = useState(0); 

  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(0) // 0-indexed
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize, setPageSize] = useState(10) // 한 페이지에 10개

  // 탭 상태
  const [currentTab, setCurrentTab] = useState("ACTIVE"); // "ACTIVE", "EXPIRED", "ALL"

  // 업로드 폼 상태
  const [file, setFile] = useState<File | null>(null)
  const [docType, setDocType] = useState("")
  const [retentionEndDate, setRetentionEndDate] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  // --- 1. 목록 조회 (Fetch) 함수 ---
  const fetchDocuments = async () => {
    if (!currentStoreId) return;
    setIsLoading(true);
    setError(null);
    try {
      // API 호출 시 모든 파라미터 전달
      const response = await axios.get<DocumentPage>(`/api/hr/documents/store/${currentStoreId}`, {
        params: {
          page: currentPage,
          size: pageSize,
          status: currentTab,
          search: submittedSearch, 
        }
      });
      
      setDocuments(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalDocuments(response.data.totalElements);
    } catch (err) {
      console.error("문서 목록 조회 실패:", err);
      setError("문서 목록을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- [수정] "submittedSearch"가 변경될 때도 목록을 다시 조회 ---
  useEffect(() => {
    fetchDocuments();
  }, [currentStoreId, currentPage, pageSize, currentTab, submittedSearch]); 

  // --- 2. 업로드 (Upload) 함수 ---
  const handleUpload = async () => {
    if (!file || !docType || !retentionEndDate || !currentStoreId) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("storeId", String(currentStoreId));
    formData.append("docType", docType);
    formData.append("retentionEndDate", retentionEndDate);

    try {
      await axios.post("/api/hr/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("업로드 성공!");
      setIsUploadDialogOpen(false);
      
      // 업로드 성공 시, 현재 탭이 '만료' 탭이 아니라면 새로고침
      if (currentTab !== "EXPIRED") {
        if (currentPage !== 0) setCurrentPage(0);
        else fetchDocuments();
      } else {
        // 만료 탭이었다면, '보관중' 탭으로 강제 이동
        setCurrentTab("ACTIVE"); 
        setCurrentPage(0); // (탭이 바뀌면서 useEffect가 fetchDocuments를 호출)
      }
      
      // 폼 초기화
      setFile(null);
      setDocType("");
      setRetentionEndDate("");
    } catch (err) {
      console.error("업로드 실패:", err);
      const errorMessage = axios.isAxiosError(err) ? (err.response?.data as string) : "업로드 실패";
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

 // --- 3. 다운로드 (Download) 함수 ---
  const handleDownload = async (documentId: number, originalFilename: string) => {
    try {
      const response = await axios.get(`/api/hr/documents/download/${documentId}`, {
        responseType: 'blob', 
      });

      // (성공 시 다운로드 로직)
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('다운로드 실패:', err);
      
      let errorMessage = "다운로드 실패"; // 기본 오류 메시지

      if (axios.isAxiosError(err) && err.response) {
        // [수정] 백엔드 응답이 Blob 형태(오류 메시지 포함)로 온 경우
        if (err.response.data instanceof Blob) {
          try {
            // Blob을 텍스트로 변환하여 실제 오류 메시지를 읽어옵니다.
            const errorText = await err.response.data.text();
            
            // 백엔드의 GlobalExceptionHandler가 "파일 찾기 오류: " 접두사를 붙이므로
            // 이 메시지를 그대로 사용합니다.
            errorMessage = errorText; 
          } catch (readError) {
            errorMessage = "오류 메시지를 읽는 데 실패했습니다.";
          }
        } else if (typeof err.response.data === 'string') {
          // 응답이 일반 텍스트인 경우
          errorMessage = err.response.data;
        }
      }
      
      // 변환된 텍스트 오류 메시지를 알림창에 띄웁니다.
      alert(errorMessage);
    }
  };

  // --- 유틸리티 함수 ---
  const getStatus = (endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isExpired = new Date(endDate) < today;
    return isExpired ? "만료" : "보관중";
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = () => {
    setSubmittedSearch(searchQuery);
    setCurrentPage(0); // 검색 시 1페이지로 초기화
  };

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    setCurrentPage(0); // 탭을 바꾸면 1페이지로 초기화
    setSearchQuery(""); 
    setSubmittedSearch(""); 
  };

  // --- 테이블/페이징 UI를 포함하는 공통 컨텐츠 ---
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
              placeholder="파일명 검색..." // 검색 기준 수정
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              className="w-64"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
        {error && <div className="text-red-500 text-center p-4">{error}</div>}
        
        {!isLoading && !error && (
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
                {documents.length > 0 ? (
                  documents.map((doc) => {
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
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
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
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      if (currentPage > 0) handlePageChange(currentPage - 1);
                    }}
                    className={!isLoading && currentPage > 0 ? "" : "pointer-events-none opacity-50"}
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
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      if (currentPage < totalPages - 1) handlePageChange(currentPage + 1);
                    }}
                    className={!isLoading && currentPage < totalPages - 1 ? "" : "pointer-events-none opacity-50"}
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
        
        {/* --- 업로드 Dialog --- */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button><Upload className="mr-2 h-4 w-4" />문서 업로드</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 문서 업로드</DialogTitle>
              <DialogDescription>
                Store ID: {currentStoreId} (으)로 새 문서를 업로드합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="docType">문서 유형</Label>
                <Input 
                  id="docType" 
                  placeholder="예: 근로계약서, 보건증" 
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retentionEndDate">보관 만료일</Label>
                <Input 
                  id="retentionEndDate" 
                  type="date" 
                  value={retentionEndDate}
                  onChange={(e) => setRetentionEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">파일 선택</Label>
                <Input 
                  id="file" 
                  type="file" 
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={isUploading}>
                취소
              </Button>
              <Button onClick={handleUpload} disabled={isUploading || !file || !docType || !retentionEndDate}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                업로드
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- 2. 탭 및 문서 목록 --- */}
      <Tabs defaultValue="ACTIVE" className="space-y-4" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="ACTIVE">
            <FileText className="mr-2 h-4 w-4" />
            보관중
          </TabsTrigger>
          <TabsTrigger value="EXPIRED">
            <FileText className="mr-2 h-4 w-4" />
            만료
          </TabsTrigger>
          <TabsTrigger value="ALL">
            <FileText className="mr-2 h-4 w-4" />
            전체 문서
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ACTIVE">
          {DocumentTableContent}
        </TabsContent>
        <TabsContent value="EXPIRED">
          {DocumentTableContent}
        </TabsContent>
        <TabsContent value="ALL">
          {DocumentTableContent}
        </TabsContent>
      </Tabs>
    </div>
  )
}