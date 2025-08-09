"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexAuthNextjsProvider 
      client={convex}
      replaceURL={(url) => {
        // Ensure we're using the correct production URL
        if (typeof window !== 'undefined' && window.location.hostname === 'moneyheavenclaude.vercel.app') {
          return url.replace('localhost', 'moneyheavenclaude.vercel.app');
        }
        return url;
      }}
    >
      {children}
    </ConvexAuthNextjsProvider>
  );
}