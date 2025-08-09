import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
  callbacks: {
    async redirect({ redirectTo }) {
      // Always ensure we return a safe, absolute URL on our app domain
      const siteUrl = process.env.SITE_URL || "https://moneyheavenclaude.vercel.app";
      const fallbackPath = "/calculator";
      try {
        const base = new URL(siteUrl);
        const target = redirectTo ? new URL(redirectTo, base) : new URL(fallbackPath, base);
        // Enforce same-origin to avoid open redirects
        if (target.origin !== base.origin) return new URL(fallbackPath, base).toString();
        return target.toString();
      } catch (_err) {
        return new URL(fallbackPath, siteUrl).toString();
      }
    },
  },
});

export type Auth = typeof auth;

