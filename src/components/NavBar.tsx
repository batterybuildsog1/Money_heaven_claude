"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "./ThemeSwitcher";

const navItems = [
  { href: "/calculator", label: "Calculator" },
  { href: "/scenarios", label: "Scenarios" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/admin", label: "Admin" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight" aria-label="Money Heaven home">Money Heaven</Link>
        <nav className="hidden gap-6 md:flex" aria-label="Primary">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);
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
        </div>
      </div>
    </header>
  );
}


