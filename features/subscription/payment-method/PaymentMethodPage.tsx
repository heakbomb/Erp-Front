"use client";

import { useState } from 'react';
import { usePaymentMethod } from './hooks/usePaymentMethod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { CreditCard, Plus, Loader2, ArrowLeft, Pencil, Check, X, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function PaymentMethodPage() {
  const { cards, loading, addCard, updateCardName, removeCard } = usePaymentMethod();
  
  // 상태 관리
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  
  // 수정 모드 관리 (어떤 카드를 수정 중인지 ID 저장)
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  // 등록 시작
  const handleStartAdd = () => {
    setNewCardName("");
    setIsAddModalOpen(true);
  };

  // 등록 실행
  const handleConfirmAdd = () => {
    setIsAddModalOpen(false);
    // 빈 값이면 기본값
    addCard(newCardName.trim() || "내 카드");
  };

  // 수정 시작
  const startEdit = (card: any) => {
    setEditingId(card.paymentId);
    setEditName(card.cardName);
  };

  // 수정 저장
  const saveEdit = (paymentId: number) => {
    if (editName.trim()) {
      updateCardName(paymentId, editName);
    }
    setEditingId(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Link href="/owner/settings">
        <Button variant="ghost" className="mb-4 pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          설정으로 돌아가기
        </Button>
      </Link>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">결제 수단 관리</h1>
        <Button onClick={handleStartAdd} disabled={loading}>
          {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          새 카드 등록
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card: any) => (
          <Card key={card.paymentId} className={card.isDefault ? "border-primary border-2" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              
              {/* ✅ 수정 모드 분기 처리 */}
              {editingId === card.paymentId ? (
                <div className="flex items-center gap-2 w-full">
                  <Input 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    className="h-8 text-sm"
                    maxLength={20} // [수정] 글자수 제한 추가
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => saveEdit(card.paymentId)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => setEditingId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {card.cardName || "신용카드"}
                    <button onClick={() => startEdit(card)} className="text-muted-foreground hover:text-primary transition-colors">
                        <Pencil className="h-3 w-3" />
                    </button>

                    {/* ✅ [추가] 삭제 버튼 */}
                    <button 
                        onClick={() => removeCard(card.paymentId)} 
                        className="text-muted-foreground hover:text-red-600 transition-colors ml-1"
                        title="카드 삭제"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                    
                  </CardTitle>
                  {card.isDefault && <span className="text-xs text-primary font-bold">기본 결제</span>}
                </>
              )}
              
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
                <div className="text-lg font-bold">
                  {card.cardNumber ? card.cardNumber : "****"}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {cards.length === 0 && (
          <div className="col-span-2 text-center py-10 text-muted-foreground border border-dashed rounded-lg bg-slate-50">
            등록된 결제 수단이 없습니다.
          </div>
        )}
      </div>

      {/* ✅ 카드 등록 전 이름 입력 모달 */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 카드 등록</DialogTitle>
            <DialogDescription>
              이 카드의 별칭을 입력해주세요 (예: 법인카드, 메인카드)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                이름
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  placeholder="내 카드"
                  maxLength={20} // [수정] 글자수 제한 추가
                />
                {/* [추가] 글자수 카운터 */}
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {newCardName.length} / 20
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>취소</Button>
            <Button onClick={handleConfirmAdd}>결제창 열기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}