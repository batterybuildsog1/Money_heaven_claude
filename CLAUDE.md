# Money Heaven Architecture Notes

This document provides an overview of the key architectural decisions and implementation details for the Money Heaven application.

## Authentication (Option A — Convex‑native)

Single source of truth is Convex. Next.js only gates routes and renders UI.

### Core Components:

1.  **`convex/auth.ts`**: This is the central configuration file for the authentication system. It defines the OAuth providers (e.g., Google) and exports the necessary functions for use in both the Convex backend and the Next.js frontend.

2.  **`src/middleware.ts`**: Gatekeeper for protected pages and the auth API route. Primary jobs:
    *   To manage session persistence by validating the user's session cookie.
    *   To protect routes by redirecting unauthenticated users away from protected pages.
    *   To improve UX by redirecting authenticated users away from public pages like the homepage.
    *   To intercept and forward interactive auth API calls (like `/api/auth/signin/google`) to Convex.

3.  **`src/app/layout.tsx` & `src/lib/convex.tsx`**: These files work together to bridge the server-side and client-side authentication states. The `ConvexAuthNextjsServerProvider` in the layout ensures that the initial authentication status determined by the middleware is correctly passed down ("hydrated") to the client-side React application.

4.  **`src/components/AuthButtons.tsx`**: This client component uses the `useAuthActions` hook from the library to trigger the sign-in and sign-out flows, which are then handled by the middleware.

### Key Environment Variables (Production):

On Vercel (Next.js):
* `CONVEX_URL` and `NEXT_PUBLIC_CONVEX_URL` = `https://<deployment>.convex.cloud`
* `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
* `JWKS`, `JWT_PRIVATE_KEY` (PKCS#8)
* `AUTH_ORIGIN` = `https://<your-app-domain>`
* `AUTH_TRUST_HOST` = `true`

On Convex:
* `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
* `JWKS`, `JWT_PRIVATE_KEY`
* `AUTH_ORIGIN` = `https://<your-app-domain>`

This setup provides a secure, robust, and seamless authentication experience.
