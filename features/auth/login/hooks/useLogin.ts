"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/shared/ui/use-toast" // toast 경로 확인 필요
import { loginOwner, handleSocialLogin as socialLoginAction } from "@/lib/api/auth.service"

export function useLogin() {
  const router = useRouter()
  const { toast } = useToast()

  // 입력 상태
  const [ownerEmail, setOwnerEmail] = useState("")
  const [ownerPassword, setOwnerPassword] = useState("")
  const [adminUsername, setAdminUsername] = useState("")
  const [adminPassword, setAdminPassword] = useState("")

  // ✅ UI 상태 (로딩, 에러)
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // 사장님 로그인 처리
  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFieldErrors({}) // 기존 에러 초기화

    try {
      // API 호출
      await loginOwner({ ownerEmail, ownerPassword })
      
      toast({ title: "환영합니다!", description: "성공적으로 로그인되었습니다." })
      router.push("/owner/dashboard") // 대시보드로 이동
    } catch (error: any) {
      // ✅ 1. 백엔드에서 받은 필드별 에러 처리 (예: 이메일 형식 오류)
      if (error.fieldErrors) {
        setFieldErrors(error.fieldErrors)
      }

      // ✅ 2. 전체 알림 메시지 (예: 아이디/비번 불일치)
      toast({
        variant: "destructive",
        title: "로그인 실패",
        description: error.friendlyMessage || "로그인 중 오류가 발생했습니다.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 직원 소셜 로그인 (단순 리다이렉트)
  const handleSocialLogin = (provider: "google" | "kakao" | "naver") => {
    socialLoginAction(provider)
  }

  // 관리자 로그인 (구현 생략 - 동일한 패턴으로 적용 가능)
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Admin login:", { adminUsername, adminPassword })
  }

  return {
    // State
    ownerEmail,
    ownerPassword,
    adminUsername,
    adminPassword,
    isLoading,   // 로딩 중 비활성화용
    fieldErrors, // 화면에 빨간 글씨 표시용

    // Setters
    setOwnerEmail,
    setOwnerPassword,
    setAdminUsername,
    setAdminPassword,

    // Handlers
    handleOwnerLogin,
    handleSocialLogin,
    handleAdminLogin,
  }
}