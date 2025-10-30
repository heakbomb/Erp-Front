"use client"

import React, { useState, useEffect } from "react" // [수정] useEffect 추가
import axios from "axios" // [신규] axios import
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
// [수정] 로딩 아이콘 추가
import { Upload, Search, Download, FileText, Loader2 } from "lucide-react" 

// [신규] API 응답 데이터 타입을 정의합니다. (백엔드 DTO와 일치)
interface Document {
  documentId: number;
  originalFilename: string;
  docType: string;
  retentionEndDate: string; // (날짜 문자열)
}

// [제거] mockDocuments 삭제

export default function DocumentManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  // [가정] 현재 선택된 사업장 ID (상위 컴포넌트나 Context API에서 받아와야 함)
  const currentStoreId = 11; 

  // --- [신규] API 연동을 위한 상태 ---
  const [documents, setDocuments] = useState<Document[]>([]) // (mockDocuments 대체)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // --- [신규] 업로드 폼 상태 ---
  const [file, setFile] = useState<File | null>(null)
  const [docType, setDocType] = useState("")
  const [retentionEndDate, setRetentionEndDate] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  // --- [신규] 1. 목록 조회 (Fetch) 함수 ---
  const fetchDocuments = async () => {
    if (!currentStoreId) return;
    setIsLoading(true);
    setError(null);
    try {
      console.log("현재 요청할 Store ID:", currentStoreId);
      // [API 호출]
      const response = await axios.get<Document[]>(`/api/hr/documents/store/${currentStoreId}`);
      setDocuments(response.data);
    } catch (err) {
      console.error("문서 목록 조회 실패:", err);
      setError("문서 목록을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- [신규] 컴포넌트 로드 시 문서 목록 조회 ---
  useEffect(() => {
    fetchDocuments();
  }, [currentStoreId]); // currentStoreId가 바뀌면 목록을 새로고침

  // --- [신규] 2. 업로드 (Upload) 함수 ---
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
      // [API 호출]
      await axios.post("/api/hr/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("업로드 성공!");
      setIsUploadDialogOpen(false);
      fetchDocuments(); // 목록 새로고침
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

  // --- [신규] 3. 다운로드 (Download) 함수 ---
  const handleDownload = async (documentId: number, originalFilename: string) => {
    try {
      // [API 호출]
      const response = await axios.get(`/api/hr/documents/download/${documentId}`, {
        responseType: 'blob', 
      });

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
      const errorMessage = axios.isAxiosError(err) ? (err.response?.data as string) : "다운로드 실패";
      alert(errorMessage);
    }
  };

  // --- [신규] 상태 계산 함수 ---
  const getStatus = (endDate: string) => {
    // 오늘 날짜 00:00:00 기준으로 비교
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isExpired = new Date(endDate) < today;
    return isExpired ? "만료" : "보관중";
  };
  
  // [신규] 검색 필터링된 목록
  const filteredDocuments = documents.filter(doc => 
    doc.originalFilename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.docType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* --- 1. 페이지 헤더 및 업로드 버튼 --- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">문서 관리</h1>
          <p className="text-muted-foreground">사업장의 인사 문서를 업로드하고 관리하세요</p>
        </div>
        
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
                {/* [연결] 폼 상태 연결 */}
                <Input 
                  id="docType" 
                  placeholder="예: 근로계약서, 보건증" 
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retentionEndDate">보관 만료일</Label>
                {/* [연결] 폼 상태 연결 */}
                <Input 
                  id="retentionEndDate" 
                  type="date" 
                  value={retentionEndDate}
                  onChange={(e) => setRetentionEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">파일 선택</Label>
                {/* [연결] 폼 상태 연결 */}
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
              {/* [연결] 업로드 핸들러 연결 */}
              <Button onClick={handleUpload} disabled={isUploading || !file || !docType || !retentionEndDate}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                업로드
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- 2. 탭 및 문서 목록 --- */}
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            전체 문서
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>문서 목록</CardTitle>
                  <CardDescription>
                    {/* [연결] 실제 문서 개수 표시 */}
                    총 {documents.length}개의 문서가 보관 중입니다
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="파일명 또는 문서 유형 검색..." // [수정]
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* [신규] 로딩 및 에러 상태 표시 */}
              {isLoading && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
              {error && <div className="text-red-500 text-center p-4">{error}</div>}
              
              {!isLoading && !error && (
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
                    {/* [연G:결] 필터링된 API 데이터로 map 실행 */}
                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map((doc) => {
                        const status = getStatus(doc.retentionEndDate) // (상태 계산)
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
                              {/* [연결] 다운로드 핸들러 연결 */}
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
                      // [신규] 데이터가 없을 경우
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          문서가 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}