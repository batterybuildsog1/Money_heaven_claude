import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
};

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth(authConfig);

export type Auth = typeof auth;
