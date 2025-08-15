import { convexAuthNextjsMiddleware, createRouteMatcher, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/calculator(.*)",
  "/scenarios(.*)",
  "/admin(.*)",
]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  // Allow public routes to pass through
  if (!isProtectedRoute(request)) {
    return;
  }
  // For protected routes, require authentication
  if (await convexAuth.isAuthenticated()) {
    return;
  }
  return nextjsMiddlewareRedirect(request, "/");
});

export const config = {
  matcher: [
    // Exclude all API routes, Next static assets, images, and favicon from middleware
    "/((?!api|_next/static|_next/image|.*\\..*|favicon.ico).*)",
  ],
};