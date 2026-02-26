import type { Metadata, Viewport } from "next";
import { M_PLUS_1, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mplus1 = M_PLUS_1({
  variable: "--font-mplus1",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "季のしおり",
  description: "今日という日の景色を開く ── 二十四節気TODOアプリ",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F2724B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${mplus1.variable} ${jetbrainsMono.variable} antialiased font-[family-name:var(--font-mplus1)]`}
        style={{ backgroundColor: "#FAFAF7" }}
      >
        {children}
      </body>
    </html>
  );
}
