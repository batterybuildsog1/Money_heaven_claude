import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
  callbacks: {
    async redirect({ redirectTo }) {
      // Environment-aware redirect logic
      const defaultUrl =
        process.env.VERCEL_ENV === "production"
          ? "https://moneyheavenclaude.vercel.app"
          : process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000";
      const siteUrl = process.env.SITE_URL || defaultUrl;
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

