import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConvexClientProvider } from '../lib/convex';
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { NavBar } from "../components/NavBar";
import "./globals.css";
import { ToastProvider } from "../components/ui/toast";
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
  title: "Money Heaven — FHA Borrowing Power Calculator",
  description: "Calculate your FHA borrowing power with accurate DTI, MIP, taxes, and insurance.",
  openGraph: {
    title: "Money Heaven — FHA Borrowing Power Calculator",
    description: "Calculate your FHA borrowing power with accurate DTI, MIP, taxes, and insurance.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Money Heaven — FHA Borrowing Power Calculator",
    description: "Calculate your FHA borrowing power with accurate DTI, MIP, taxes, and insurance.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          themes={["light", "dark", "steel", "prismatic"]}
          storageKey="app-theme"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <ConvexAuthNextjsServerProvider>
            <ConvexClientProvider>
              <ToastProvider>
                <NavBar />
                <main id="main-content">{children}</main>
              </ToastProvider>
            </ConvexClientProvider>
          </ConvexAuthNextjsServerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
