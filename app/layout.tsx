import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "语音教练 · 实时字幕与表达反馈",
  description: "实时语音转文字（中文 / English US），并对表达逻辑给出即时建议。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
