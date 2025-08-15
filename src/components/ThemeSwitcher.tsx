"use client";

import { useEffect, useMemo, useState } from "react";

type ThemeOption = "theme-light" | "theme-dark" | "theme-steel" | "theme-prismatic";

const THEME_STORAGE_KEY = "app-theme";

function applyTheme(theme: ThemeOption) {
  const root = document.documentElement;
  // replace ocean with steel & prismatic
  const legacy = root.classList.contains("theme-ocean");
  if (legacy) root.classList.remove("theme-ocean");
  const knownNow: ThemeOption[] = ["theme-light", "theme-dark", "theme-steel", "theme-prismatic"];
  for (const t of knownNow) root.classList.remove(t);
  root.classList.add(theme);
}

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ThemeOption>("theme-dark");

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
    const stored = (typeof window !== "undefined" && (localStorage.getItem(THEME_STORAGE_KEY) as ThemeOption)) || null;
    const preferred = stored ?? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "theme-dark" : "theme-light");
    setTheme(preferred);
    applyTheme(preferred);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mounted) return;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
  }, [theme, mounted]);

  const options = useMemo(
    () => [
      { value: "theme-light" as ThemeOption, label: "Light" },
      { value: "theme-dark" as ThemeOption, label: "Dark" },
      { value: "theme-steel" as ThemeOption, label: "Steel" },
      { value: "theme-prismatic" as ThemeOption, label: "Prismatic" },
    ],
    []
  );

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="inline-flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Theme</label>
        <div className="h-9 w-24 rounded-md border bg-background px-2 text-sm"></div>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <label htmlFor="theme-select" className="text-sm text-muted-foreground">Theme</label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value as ThemeOption)}
        className="h-9 rounded-md border bg-background px-2 text-sm"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}


