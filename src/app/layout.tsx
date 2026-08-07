import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { FirebaseAnalytics } from "@/components/FirebaseAnalytics";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "华语Talk Master - แอปฝึกสนทนาภาษาจีน & ออกเสียง Pinyin",
  description: "แอปพลิเคชันฝึกสนทนาภาษาจีน & ออกเสียง Pinyin สำหรับคนไทย",
  openGraph: {
    title: "华语Talk Master - แอปฝึกสนทนาภาษาจีน & ออกเสียง Pinyin",
    description: "แอปพลิเคชันฝึกสนทนาภาษาจีน & ออกเสียง Pinyin สำหรับคนไทย",
    siteName: "华语Talk Master",
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "华语Talk Master - แอปฝึกสนทนาภาษาจีน & ออกเสียง Pinyin",
    description: "แอปพลิเคชันฝึกสนทนาภาษาจีน & ออกเสียง Pinyin สำหรับคนไทย",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-slate-50 text-slate-900`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <AuthProvider>
          <Suspense fallback={null}>
            <FirebaseAnalytics />
          </Suspense>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
