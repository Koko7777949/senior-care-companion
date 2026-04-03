import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "رفيق كبار السن - تطبيق العناية الذكية",
  description: "تطبيق متكامل لكبار السن يشمل تذكيرات الأدوية، نظام الطوارئ، المساعد الصوتي الذكي، ومراقبة الصحة",
  keywords: ["كبار السن", "رعاية صحية", "تذكير الأدوية", "طوارئ", "مساعد ذكي", "صحة"],
  authors: [{ name: "Z.ai Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "رفيق كبار السن",
    description: "تطبيق متكامل لكبار السن يشمل تذكيرات الأدوية، نظام الطوارئ، المساعد الصوتي الذكي",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
