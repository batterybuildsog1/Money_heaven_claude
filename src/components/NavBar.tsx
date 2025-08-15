"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthToken } from "@convex-dev/auth/react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { AuthButtons } from "./AuthButtons";

const navItems = [
  { href: "/calculator", label: "Calculator", protected: false },
  { href: "/scenarios", label: "Scenarios", protected: true },
  { href: "/dashboard", label: "Dashboard", protected: true },
  { href: "/admin", label: "Admin", protected: true },
];

export function NavBar() {
  const pathname = usePathname();
  const token = useAuthToken();
  const isAuthenticated = !!token;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight" aria-label="Money Heaven home">Money Heaven</Link>
        <nav className="hidden gap-6 md:flex" aria-label="Primary">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            const shouldShow = !item.protected || isAuthenticated;
            
            if (!shouldShow) {
              return (
                <span
                  key={item.href}
                  className="text-sm text-muted-foreground/50 cursor-not-allowed"
                  title="Sign in required"
                >
                  {item.label}
                </span>
              );
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors hover:text-foreground ${active ? "text-foreground" : "text-muted-foreground"}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:rounded focus:border focus:px-2 focus:py-1">Skip to content</a>
          <ThemeSwitcher />
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}


