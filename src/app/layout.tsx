import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConvexClientProvider } from '../lib/convex';
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { NavBar } from "../components/NavBar";
import "./globals.css";
import { ToastProvider } from "../components/ui/toast";

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
    apple: [{ url: "/icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="theme-dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var key = 'app-theme';
                  var stored = localStorage.getItem(key);
                  var preferred = stored || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'theme-dark' : 'theme-light');
                  var root = document.documentElement;
                  var classes = ['theme-light','theme-dark','theme-steel','theme-prismatic'];
                  for (var i=0; i<classes.length; i++) root.classList.remove(classes[i]);
                  root.classList.add(preferred);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ConvexAuthNextjsServerProvider>
          <ConvexClientProvider>
            <ToastProvider>
              <NavBar />
              <main id="main-content">{children}</main>
            </ToastProvider>
          </ConvexClientProvider>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
