"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface Delta {
  value: number; // percentage delta, positive = up
  direction?: "up" | "down"; // optional explicit direction
}

export interface KpiTileProps {
  label: string;
  value: string | number;
  subtitle?: string;
  delta?: Delta;
  icon?: React.ReactNode;
  className?: string;
}

export function KpiTile({ label, value, subtitle, delta, icon, className }: KpiTileProps) {
  const dir: "up" | "down" | undefined = delta?.direction ?? (delta ? (delta.value >= 0 ? "up" : "down") : undefined);
  const deltaAbs = Math.abs(delta?.value ?? 0).toFixed(1);

  return (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md", className)}>
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{label}</div>
        {icon && <div className="text-foreground/70">{icon}</div>}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight motion-hover">{value}</div>
      <div className="mt-1 flex items-center justify-between text-xs">
        {subtitle && <div className="text-muted-foreground">{subtitle}</div>}
        {delta && (
          <div className={cn("inline-flex items-center gap-1 rounded px-2 py-0.5", dir === "up" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400") }>
            <span className="tabular-nums">{dir === "down" ? "-" : "+"}{deltaAbs}%</span>
          </div>
        )}
      </div>
    </div>
  );
}


