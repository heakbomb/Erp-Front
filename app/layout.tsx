// app/layout.tsx

import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"


export const metadata: Metadata = {
  title: "요식업 ERP 시스템",
  description: "요식업 자영업자를 위한 통합 ERP 플랫폼",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // 확장프로그램이 html/body에 attribute 끼워넣어도 에러 안 나게
    <html lang="ko" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}