import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
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

const outfit = Outfit({
  variable: "--font-pinyin",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "华语Talk Master - ภาษาจีนเอาตัวรอดสำหรับคนไทย",
  description: "แอปพลิเคชันฝึกสนทนาภาษาจีน & ออกเสียง Pinyin สำหรับคนไทย ท่องเที่ยวจีน",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Talk Master",
  },
  openGraph: {
    title: "华语Talk Master - ภาษาจีนเอาตัวรอดสำหรับคนไทย",
    description: "แอปพลิเคชันฝึกสนทนาภาษาจีน & ออกเสียง Pinyin สำหรับคนไทย ท่องเที่ยวจีน",
    siteName: "华语Talk Master",
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "华语Talk Master - ภาษาจีนเอาตัวรอดสำหรับคนไทย",
    description: "แอปพลิเคชันฝึกสนทนาภาษาจีน & ออกเสียง Pinyin สำหรับคนไทย ท่องเที่ยวจีน",
  },
  icons: {
    icon: "/app-icon.png",
    shortcut: "/app-icon.png",
    apple: "/apple-touch-icon.png",
  },
};

import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased bg-slate-50 text-slate-900`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <AuthProvider>
          <Suspense fallback={null}>
            <FirebaseAnalytics />
          </Suspense>
          {children}
          <PWAInstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
