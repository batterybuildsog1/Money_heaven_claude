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
        typeof window !== 'undefined' && window.location.pathname === "/" 
          ? "/calculator" 
          : window.location.pathname || "/calculator";
      await signIn("google", { redirectTo });
    } catch (err) {
      console.error("❌ AuthButtons: sign-in error", err);
    }
  }, [signIn]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
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


