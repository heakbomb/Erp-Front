"use client"

import { useState } from "react"
import type React from "react"
import { requestPasswordReset } from "../services/forgotPasswordService"

export function useForgotPassword() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // 기존 로직 + service 호출
    await requestPasswordReset(email)
    setSubmitted(true)
  }

  return {
    email,
    submitted,
    setEmail,
    handleSubmit,
  }
}