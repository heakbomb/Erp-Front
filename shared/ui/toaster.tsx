"use client"

import {
  Toast as RadixToast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/shared/ui/toast"
import { useToast } from "@/shared/ui/use-toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action }) => (
        <RadixToast
          key={id}
          // Radix Toast 에 필요한 prop들 기본값
          onOpenChange={(open) => {
            if (!open) {
              dismiss(id)
            }
          }}
        >
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </RadixToast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}