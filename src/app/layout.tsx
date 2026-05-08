import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LifeBlood Connect - Blood Donation Management System",
  description: "Every Drop Counts, Every Donor Saves a Life. Join LifeBlood Connect to schedule appointments, track donations, and help save lives in Uganda.",
  keywords: ["blood donation", "Uganda", "donor", "blood bank", "save lives", "LifeBlood Connect"],
  authors: [{ name: "LifeBlood Connect Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "LifeBlood Connect - Blood Donation Management System",
    description: "Every Drop Counts, Every Donor Saves a Life. Join Uganda's digital blood donation platform.",
    siteName: "LifeBlood Connect",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
