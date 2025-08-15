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
  // Standard Convex Auth matcher - includes auth API routes
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};