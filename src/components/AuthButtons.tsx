"use client";

import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import { Button } from "./ui/button";
import { useCallback, useMemo } from "react";

export function AuthButtons() {
  const token = useAuthToken();
  const { signIn, signOut } = useAuthActions();

  const isLoading = token === undefined;
  const isAuthenticated = useMemo(() => token !== null && token !== undefined && typeof token === "string", [token]);

  const handleSignIn = useCallback(async () => {
    try {
      const redirectTo = 
        typeof window !== "undefined" && window.location.pathname === "/" 
          ? "/calculator" 
          : window.location.pathname || "/calculator";
      console.log("🔑 AuthButtons: initiating sign-in", { redirectTo, convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL });
      const result = await signIn("google", { redirectTo });
      console.log("✅ AuthButtons: sign-in started", result);
    } catch (err) {
      console.error("❌ AuthButtons: sign-in error", err);
    }
  }, [signIn]);

  const handleSignOut = useCallback(async () => {
    try {
      console.log("🔒 AuthButtons: signing out");
      await signOut();
      console.log("✅ AuthButtons: sign-out complete");
    } catch (err) {
      console.error("❌ AuthButtons: sign-out error", err);
    }
  }, [signOut]);

  if (isLoading) return null;

  return isAuthenticated ? (
    <Button size="sm" variant="outline" onClick={handleSignOut}>Sign out</Button>
  ) : (
    <Button size="sm" onClick={handleSignIn}>Log in</Button>
  );
}


