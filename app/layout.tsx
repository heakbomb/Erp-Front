import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import QueryProvider from "@/contexts/QueryProvider"; // 👈 1. 방금 만든 Provider 임포트

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "요식업 ERP 시스템",
  description: "요식업 자영업자를 위한 통합 ERP 플랫폼",
  generator: "",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          {/* 👈 2. AuthProvider 안에 QueryProvider 추가 */}
          <QueryProvider>
            {children}
            <Analytics />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}