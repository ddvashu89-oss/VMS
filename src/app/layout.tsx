import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import ClientProvider from "@/components/auth/client-provider";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Paryatan Foundation | VMS",
  description: "Visitor Management System for Paryatan Foundation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-premium-gradient bg-grid-pattern font-sans relative">
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
