"use client";

import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import { Button } from "./ui/button";
import { useCallback, useMemo, useState, useEffect } from "react";
export function AuthButtons() {
  const token = useAuthToken();
  const { signIn, signOut } = useAuthActions();
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch by not rendering until client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const isLoading = token === undefined;
  const isAuthenticated = useMemo(() => token !== null && token !== undefined && typeof token === "string", [token]);

  const handleSignIn = useCallback(async () => {
    try {
      const redirectTo = 
        typeof window !== "undefined" && window.location.pathname === "/" 
          ? "/calculator" 
          : window.location.pathname || "/calculator";
      // eslint-disable-next-line no-console
      console.debug("MH:signin:start", { redirectTo });
      await signIn("google", { redirectTo });
      // eslint-disable-next-line no-console
      console.debug("MH:signin:done");
    } catch (err) {
      console.error("❌ AuthButtons: sign-in error", err);
    }
  }, [signIn]);

  const handleSignOut = useCallback(async () => {
    try {
      // eslint-disable-next-line no-console
      console.debug("MH:signout:start");
      await signOut();
      // eslint-disable-next-line no-console
      console.debug("MH:signout:done");
    } catch (err) {
      console.error("❌ AuthButtons: sign-out error", err);
    }
  }, [signOut]);

  // Render placeholder during SSR and initial hydration
  if (!isClient || isLoading) {
    // eslint-disable-next-line no-console
    console.debug("MH:authbuttons:loading", { token: token === undefined ? "undefined" : token === null ? "null" : "present" });
    return <div className="h-9 w-20 bg-background"></div>;
  }

  return isAuthenticated ? (
    <Button size="sm" variant="outline" onClick={handleSignOut}>Sign out</Button>
  ) : (
    <Button size="sm" onClick={handleSignIn}>Log in</Button>
  );
}
