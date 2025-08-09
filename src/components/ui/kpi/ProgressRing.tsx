"use client";

import React from "react";

interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  bg?: string;
  children?: React.ReactNode;
}

export function ProgressRing({ value, size = 64, strokeWidth = 6, color = "currentColor", bg = "var(--color-border)", children }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const dash = (clamped / 100) * c;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="motion-hover">
      <circle cx={size / 2} cy={size / 2} r={r} stroke={bg} strokeWidth={strokeWidth} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {children && (
        <foreignObject x="0" y="0" width={size} height={size}>
          <div className="flex h-full w-full items-center justify-center text-xs">{children}</div>
        </foreignObject>
      )}
    </svg>
  );
}


