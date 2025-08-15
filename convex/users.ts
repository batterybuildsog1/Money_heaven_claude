import { query } from "./_generated/server";

/**
 * Gets the identity of the current user.
 * Returns null if the user is not authenticated.
 */
export const currentUser = query({
  handler: async (ctx) => {
    return await ctx.auth.getUserIdentity();
  },
});
