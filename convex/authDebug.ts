import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const checkAuth = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const identity = await ctx.auth.getUserIdentity();
    
    console.log("🔍 Server-side auth check:", {
      userId,
      identity,
      hasUserId: !!userId,
      hasIdentity: !!identity,
      timestamp: new Date().toISOString()
    });
    
    return {
      isAuthenticated: !!userId,
      userId: userId || null,
      identity: identity || null,
      debugInfo: {
        userIdType: typeof userId,
        identityType: typeof identity,
        timestamp: Date.now()
      }
    };
  },
});