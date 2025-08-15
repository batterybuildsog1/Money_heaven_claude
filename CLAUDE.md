# Money Heaven Architecture Notes

This document provides an overview of the key architectural decisions and implementation details for the Money Heaven application.

## Authentication

Our authentication system is built using the `@convex-dev/auth` library, which employs a hybrid architecture that leverages both Next.js Middleware and the Convex backend.

### Core Components:

1.  **`convex/auth.ts`**: This is the central configuration file for the authentication system. It defines the OAuth providers (e.g., Google) and exports the necessary functions for use in both the Convex backend and the Next.js frontend.

2.  **`src/middleware.ts`**: This is the gatekeeper for our application. It runs on every request to a protected page or the auth API route. Its primary jobs are:
    *   To manage session persistence by validating the user's session cookie.
    *   To protect routes by redirecting unauthenticated users away from protected pages.
    *   To improve UX by redirecting authenticated users away from public pages like the homepage.
    *   To intercept and handle the interactive auth API calls (like `/api/auth/signin/google`) initiated from the client.

3.  **`src/app/layout.tsx` & `src/lib/convex.tsx`**: These files work together to bridge the server-side and client-side authentication states. The `ConvexAuthNextjsServerProvider` in the layout ensures that the initial authentication status determined by the middleware is correctly passed down ("hydrated") to the client-side React application.

4.  **`src/components/AuthButtons.tsx`**: This client component uses the `useAuthActions` hook from the library to trigger the sign-in and sign-out flows, which are then handled by the middleware.

### Key Environment Variables (Production):

*   `JWT_PRIVATE_KEY`: A **PKCS#8 formatted** private key used by the Convex backend to sign session tokens (JWTs). This must be a multi-line value.
*   `JWKS`: A **JWK Set JSON object** containing the public key, used by the backend to verify the tokens it signs.

This setup provides a secure, robust, and seamless authentication experience.
