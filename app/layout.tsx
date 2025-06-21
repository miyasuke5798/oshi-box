import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "推しBox",
  description: "推しBoxの説明文です。",
  openGraph: {
    title: "推しBox",
    description: "推しBoxの説明文です。",
    type: "website",
    images: [
      {
        url: "/oshi_box_logo.png",
        width: 1200,
        height: 630,
        alt: "推しBox",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "推しBox",
    description: "推しBoxの説明文です。",
    images: ["/oshi_box_logo.png"],
  },
  icons: {
    icon: "/oshi_box_logo.png",
    apple: "/oshi_box_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-right" closeButton={false} />
      </body>
    </html>
  );
}
