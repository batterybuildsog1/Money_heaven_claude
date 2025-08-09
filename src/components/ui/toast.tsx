"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ToastVariant = "default" | "success" | "warning" | "destructive" | "info";

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface ToastItem extends Required<ToastOptions> {
  id: string;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const toast = useCallback((options: ToastOptions) => {
    const id = `t_${Date.now()}_${counter.current++}`;
    const item: ToastItem = {
      id,
      title: options.title ?? "",
      description: options.description ?? "",
      variant: options.variant ?? "default",
      durationMs: options.durationMs ?? 2200,
    };
    setToasts((prev) => [...prev, item]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, item.durationMs);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(<ToastViewport toasts={toasts} />, document.body)}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");

  const success = useCallback((message: string, opts?: Omit<ToastOptions, "variant" | "description">) => {
    ctx.toast({ title: message, variant: "success", durationMs: opts?.durationMs });
  }, [ctx]);

  const error = useCallback((message: string, opts?: Omit<ToastOptions, "variant" | "description">) => {
    ctx.toast({ title: message, variant: "destructive", durationMs: opts?.durationMs });
  }, [ctx]);

  const info = useCallback((message: string, opts?: Omit<ToastOptions, "variant" | "description">) => {
    ctx.toast({ title: message, variant: "info", durationMs: opts?.durationMs });
  }, [ctx]);

  return { toast: ctx.toast, success, error, info };
}

function ToastViewport({ toasts }: { toasts: ToastItem[] }) {
  // Ensure mounting order for hydration safety
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end sm:justify-end">
      <ul className="flex w-full max-w-sm flex-col gap-2" aria-live="polite" aria-relevant="additions" aria-atomic="true">
        {toasts.map((t) => (
          <li
            key={t.id}
            className={[
              "pointer-events-auto rounded-md border p-3 shadow-lg backdrop-blur-sm",
              "animate-fade-in motion-hover",
              toastVariantClass(t.variant),
            ].join(" ")}
            role={t.variant === "destructive" || t.variant === "warning" ? "alert" : "status"}
            aria-live={t.variant === "destructive" || t.variant === "warning" ? "assertive" : "polite"}
            aria-atomic="true"
          >
            {t.title && <div className="text-sm font-medium">{t.title}</div>}
            {t.description && <div className="text-xs opacity-80">{t.description}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function toastVariantClass(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return "bg-green-600/10 border-green-500/30 text-green-200";
    case "warning":
      return "bg-amber-600/10 border-amber-500/30 text-amber-200";
    case "destructive":
      return "bg-red-600/10 border-red-500/30 text-red-200";
    case "info":
      return "bg-blue-600/10 border-blue-500/30 text-blue-200";
    default:
      return "bg-slate-700/40 border-slate-600/50 text-slate-100";
  }
}

export { ToastViewport };


