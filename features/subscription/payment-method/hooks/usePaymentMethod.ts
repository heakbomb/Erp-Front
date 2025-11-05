// features/subscription/payment-method/hooks/usePaymentMethod.ts
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { updatePaymentMethod } from "../paymentMethodService"

// ⭐️ 폼 상태 타입 정의
type PaymentFormState = {
    // Card
    cardNumber: string;
    expiry: string;
    cvc: string;
    cardHolder: string;
    // Bank
    bankName: string;
    accountNumber: string;
    accountHolder: string;
}

const initialFormState: PaymentFormState = {
    cardNumber: "",
    expiry: "",
    cvc: "",
    cardHolder: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
}

export function usePaymentMethod() {
    const router = useRouter()
    const [paymentType, setPaymentType] = useState<"card" | "bank">("card")

    // ⭐️ 폼 입력을 하나의 객체로 관리
    const [formState, setFormState] = useState<PaymentFormState>(initialFormState)

    // ⭐️ 폼 입력 핸들러
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    }

    // ⭐️ 저장 뮤테이션
    const saveMutation = useMutation({
        mutationFn: updatePaymentMethod,
        onSuccess: () => {
            alert("결제 수단이 변경되었습니다")
            router.push("/owner/settings")
        },
        onError: (error) => {
            alert(`저장 실패: ${error.message}`)
        }
    })

    // ⭐️ 저장 핸들러
    const handleSave = () => {
        // ⭐️ (필수) 여기서 Zod 등을 사용한 유효성 검사가 필요합니다.

        let paymentDetails = {};
        if (paymentType === "card") {
            paymentDetails = {
                cardNumber: formState.cardNumber,
                expiry: formState.expiry,
                cvc: formState.cvc,
                cardHolder: formState.cardHolder,
            };
        } else {
            paymentDetails = {
                bankName: formState.bankName,
                accountNumber: formState.accountNumber,
                accountHolder: formState.accountHolder,
            };
        }

        saveMutation.mutate({
            type: paymentType,
            details: paymentDetails,
        })
    }

    return {
        paymentType,
        setPaymentType,
        handleSave,
        isSaving: saveMutation.isPending,
        formState,
        handleFormChange,
    }
}