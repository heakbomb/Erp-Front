"use client"

import * as React from "react"

// ✅ 수정됨: variant 속성 추가 ("default" | "destructive")
export type ToastParams = {
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  durationMs?: number
  variant?: "default" | "destructive" 
}

type ToasterState = {
  toasts: ToastParams[]
}

const listeners = new Set<(state: ToasterState) => void>()

let memoryState: ToasterState = {
  toasts: [],
}

function notify(state: ToasterState) {
  memoryState = state
  for (const listener of listeners) {
    listener(state)
  }
}

function addToast(toast: ToastParams) {
  const id = toast.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const duration = toast.durationMs ?? 4000

  const next: ToasterState = {
    toasts: [...memoryState.toasts, { ...toast, id }],
  }

  notify(next)

  // 자동 제거 타이머
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

function removeToast(id?: string) {
  if (!id) {
    notify({ toasts: [] })
    return
  }
  const next: ToasterState = {
    toasts: memoryState.toasts.filter((t) => t.id !== id),
  }
  notify(next)
}

/**
 * 전역에서 사용하는 toast 함수
 */
export function toast(params: ToastParams) {
  return addToast(params)
}

/**
 * Toaster 컴포넌트에서 사용하는 hook
 */
export function useToast() {
  const [state, setState] = React.useState<ToasterState>(memoryState)

  React.useEffect(() => {
    listeners.add(setState)
    return () => {
      listeners.delete(setState)
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: removeToast,
  }
}