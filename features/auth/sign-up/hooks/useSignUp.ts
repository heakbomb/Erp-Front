"use client"

import { useState } from "react"
import { signUpOwner, type SignUpRequest } from "../services/signUpService"

export default function useSignUp() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessNumber: "",
    phone: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const validate = (): string | null => {
    if (form.password !== form.confirmPassword) return "비밀번호가 일치하지 않습니다."
    if (!form.email.includes("@")) return "올바른 이메일 형식을 입력하세요."
    if (form.businessNumber.trim().length < 10)
      return "사업자등록번호가 올바르지 않습니다."
    return null
  }

  const submit = async () => {
    const validation = validate()
    if (validation) {
      setError(validation)
      return
    }

    setError(null)
    setLoading(true)

    try {
      const requestData: SignUpRequest = {
        name: form.name,
        email: form.email,
        password: form.password,
        businessName: form.businessName,
        businessNumber: form.businessNumber,
        phone: form.phone,
      }

      const result = await signUpOwner(requestData)
      setSuccessMessage(result.message)
    } catch (e: any) {
      setError(e?.message ?? "회원가입 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return {
    form,
    loading,
    error,
    successMessage,
    updateField,
    submit,
  }
}