import { convexAuthNextjsMiddleware, createRouteMatcher, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";

const isPublicPage = createRouteMatcher(["/"]);

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/calculator(.*)",
  "/scenarios(.*)",
  "/admin(.*)",
]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated();
  // Lightweight server-side log for routing decisions
  // Note: console statements in middleware show in server logs
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookieNames = cookieHeader
      .split(";")
      .map((c) => c.split("=")[0]?.trim())
      .filter((n) => n);
    console.debug("MH:middleware", {
      path: request.nextUrl.pathname,
      isAuthenticated,
      cookies: cookieNames.slice(0, 12),
      env: {
        convexUrlClient: process.env.NEXT_PUBLIC_CONVEX_URL ? "set" : "missing",
        convexUrlServer: process.env.CONVEX_URL ? "set" : "missing",
        googleClientId: !!process.env.GOOGLE_CLIENT_ID,
        googleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        jwks: !!process.env.JWKS,
        jwtPrivateKey: !!process.env.JWT_PRIVATE_KEY,
        authOrigin: process.env.AUTH_ORIGIN || "(unset)",
      },
    });
  } catch (e) {
    console.debug("MH:middleware:log_error", String(e));
  }

  if (isPublicPage(request) && isAuthenticated) {
    console.debug("MH:middleware:redirect", { from: request.nextUrl.pathname, to: "/calculator" });
    return nextjsMiddlewareRedirect(request, "/calculator");
  }

  if (isProtectedRoute(request) && !isAuthenticated) {
    console.debug("MH:middleware:redirect", { from: request.nextUrl.pathname, to: "/" });
    return nextjsMiddlewareRedirect(request, "/");
  }
});

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/calculator/:path*",
    "/scenarios/:path*",
    "/admin/:path*",
    "/api/auth/:path*",
  ],
};
