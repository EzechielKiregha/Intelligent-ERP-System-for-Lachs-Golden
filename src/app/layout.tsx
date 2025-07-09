import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";
import { LoadingProvider } from "@/contexts/loadingContext";
import ToastProvider from "@/components/providers/toaster-provider";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Intelligent ERP GOLD",
  description: "Intelligent ERP System for Modern Business Streamline your operations with AI-powered insights and automation at Golden Intelingent ERP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LoadingProvider>
          <Providers>
            <Suspense>{children}</Suspense>
          </Providers>
        </LoadingProvider>
      </body>
    </html>
  );
}