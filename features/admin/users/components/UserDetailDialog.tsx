import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, User, CreditCard, Calendar, Mail, Clock } from "lucide-react";
import { OwnerDetailResponse } from "../adminUsersService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: OwnerDetailResponse | null;
}

export function UserDetailDialog({ isOpen, onClose, user }: Props) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" />
            {/* ✅ [수정] username 사용 */}
            {user.username} 사장님 상세 정보
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">기본 정보</TabsTrigger>
            <TabsTrigger value="stores">보유 사업장 ({user.stores.length})</TabsTrigger>
            <TabsTrigger value="subscription">구독 정보</TabsTrigger>
          </TabsList>

          {/* 1. 기본 정보 탭 */}
          <TabsContent value="info" className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard 
                icon={<Mail className="h-4 w-4 text-muted-foreground" />}
                label="이메일" 
                value={user.email} 
              />
              <InfoCard 
                icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                label="가입일" 
                value={new Date(user.createdAt).toLocaleDateString()} 
              />
            </div>
          </TabsContent>

          {/* 2. 사업장 목록 탭 */}
          <TabsContent value="stores" className="py-4 space-y-3">
            {user.stores.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg">
                등록된 사업장이 없습니다.
              </div>
            ) : (
              user.stores.map((store) => (
                <Card key={store.storeId} className="overflow-hidden">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mt-1">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{store.storeName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {store.industry}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <Badge variant="outline">{store.status}</Badge>
                       {store.active ? (
                         <Badge variant="default" className="bg-green-600">Active</Badge>
                       ) : (
                         <Badge variant="secondary">Inactive</Badge>
                       )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* 3. 구독 정보 탭 */}
          <TabsContent value="subscription" className="py-4">
            {!user.subscription ? (
              <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg">
                현재 활성화된 구독이 없습니다. (무료 이용 중)
              </div>
            ) : (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    {user.subscription.subName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">월 결제 금액</span>
                      <p className="font-medium text-lg">
                        {user.subscription.monthlyPrice.toLocaleString()}원
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">상태</span>
                      <div>
                        <Badge className={user.subscription.isActive ? "bg-green-600" : "bg-gray-400"}>
                          {user.subscription.isActive ? "이용 중" : "만료/해지"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      기간: {new Date(user.subscription.startDate).toLocaleDateString()} ~ {new Date(user.subscription.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col space-y-1.5 p-4 border rounded-lg bg-white">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <span className="font-medium pl-6">{value}</span>
    </div>
  );
}