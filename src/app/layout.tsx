import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "만파식(Manpasik) - 홍익인간 헬스케어 플랫폼",
  description: "차동측정 기반 범용 분석 시스템 통합 플랫폼 - 전 세계를 연결하는 하드웨어 제어 및 헬스케어",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "만파식",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "만파식",
    title: "만파식(Manpasik) - 홍익인간 헬스케어 플랫폼",
    description: "차동측정 기반 범용 분석 시스템 통합 플랫폼",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "만파식(Manpasik)",
    description: "홍익인간 헬스케어 플랫폼",
  },
  keywords: ["만파식", "Manpasik", "헬스케어", "건강", "혈당", "측정", "AI", "코칭"],
  authors: [{ name: "Manpasik Team" }],
  creator: "Manpasik",
  publisher: "Manpasik",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0ea5e9" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard 웹폰트 CDN */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        {/* PWA 아이콘 */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/icon-192x192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        {/* iOS 스플래시 스크린 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-pretendard antialiased">{children}</body>
    </html>
  );
}
