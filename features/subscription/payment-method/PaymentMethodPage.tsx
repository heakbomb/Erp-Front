// features/subscription/payment-method/PaymentMethodPage.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group"
import { CreditCard, Building2, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { usePaymentMethod } from "./hooks/usePaymentMethod"

export default function PaymentMethodPage() {
    const {
        paymentType,
        setPaymentType,
        handleSave,
        isSaving,
        // ⭐️ 폼 상태 추가
        formState,
        handleFormChange,
    } = usePaymentMethod()

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Link href="/owner/settings">
                <Button variant="ghost" className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    설정으로 돌아가기
                </Button>
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>결제 수단 변경</CardTitle>
                    <CardDescription>새로운 결제 수단을 등록하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <Label>결제 방법 선택</Label>
                        <RadioGroup
                            value={paymentType}
                            onValueChange={(val) => setPaymentType(val as "card" | "bank")}
                            disabled={isSaving}
                        >
                            <Label
                                htmlFor="card"
                                className="flex items-center space-x-2 p-4 rounded-lg border cursor-pointer hover:bg-muted/50"
                            >
                                <RadioGroupItem value="card" id="card" />
                                <div className="flex items-center gap-2 cursor-pointer flex-1">
                                    <CreditCard className="h-5 w-5" />
                                    <span>신용/체크카드</span>
                                </div>
                            </Label>
                            <Label
                                htmlFor="bank"
                                className="flex items-center space-x-2 p-4 rounded-lg border cursor-pointer hover:bg-muted/50"
                            >
                                <RadioGroupItem value="bank" id="bank" />
                                <div className="flex items-center gap-2 cursor-pointer flex-1">
                                    <Building2 className="h-5 w-5" />
                                    <span>계좌이체</span>
                                </div>
                            </Label>
                        </RadioGroup>
                    </div>

                    {paymentType === "card" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="cardNumber">카드 번호</Label>
                                <Input
                                    id="cardNumber"
                                    name="cardNumber"
                                    placeholder="0000-0000-0000-0000"
                                    value={formState.cardNumber}
                                    onChange={handleFormChange}
                                    disabled={isSaving}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expiry">유효기간</Label>
                                    <Input
                                        id="expiry"
                                        name="expiry"
                                        placeholder="MM/YY"
                                        value={formState.expiry}
                                        onChange={handleFormChange}
                                        disabled={isSaving}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cvc">CVC</Label>
                                    <Input
                                        id="cvc"
                                        name="cvc"
                                        placeholder="000"
                                        type="password"
                                        maxLength={3}
                                        value={formState.cvc}
                                        onChange={handleFormChange}
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cardHolder">카드 소유자명</Label>
                                <Input
                                    id="cardHolder"
                                    name="cardHolder"
                                    placeholder="홍길동"
                                    value={formState.cardHolder}
                                    onChange={handleFormChange}
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                    )}

                    {paymentType === "bank" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="bankName">은행명</Label>
                                <Input
                                    id="bankName"
                                    name="bankName"
                                    placeholder="은행을 선택하세요"
                                    value={formState.bankName}
                                    onChange={handleFormChange}
                                    disabled={isSaving}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accountNumber">계좌번호</Label>
                                <Input
                                    id="accountNumber"
                                    name="accountNumber"
                                    placeholder="계좌번호를 입력하세요"
                                    value={formState.accountNumber}
                                    onChange={handleFormChange}
                                    disabled={isSaving}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accountHolder">예금주명</Label>
                                <Input
                                    id="accountHolder"
                                    name="accountHolder"
                                    placeholder="홍길동"
                                    value={formState.accountHolder}
                                    onChange={handleFormChange}
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                    )}

                    <div className="rounded-lg bg-muted p-4">
                        <p className="text-sm text-muted-foreground">
                            결제 정보는 안전하게 암호화되어 저장됩니다. 다음 결제일부터 새로운 결제 수단이 적용됩니다.
                        </p>
                    </div>

                    <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        결제 수단 저장
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}