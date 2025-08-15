"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";

// eslint-disable-next-line no-console
try {
  console.debug("MH:convex:url", { url: process.env.NEXT_PUBLIC_CONVEX_URL });
} catch {}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
  // Enable verbose client logs to trace auth/session/network
  verbose: true,
});

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexAuthNextjsProvider 
      client={convex}
    >
      {children}
    </ConvexAuthNextjsProvider>
  );
}