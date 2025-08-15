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
  console.debug("MH:middleware", {
    path: request.nextUrl.pathname,
    isAuthenticated,
  });

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
