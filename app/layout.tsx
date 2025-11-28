// app/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script"; // ✅ [추가] 스크립트 컴포넌트 임포트
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import QueryProvider from "@/contexts/QueryProvider";

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
          <QueryProvider>
            {children}
            <Analytics />
            
            {/* ✅ [추가] 포트원 V2 SDK 스크립트 */}
            <Script 
              src="https://cdn.portone.io/v2/browser-sdk.js"
              strategy="lazyOnload" 
            />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}