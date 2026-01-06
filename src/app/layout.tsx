import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "만파식(Manpasik) - 홍익인간 헬스케어 플랫폼",
  description: "전 세계를 연결하는 하드웨어 제어 및 헬스케어 플랫폼",
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
      </head>
      <body className="font-pretendard">{children}</body>
    </html>
  );
}
