"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuthToken } from "@convex-dev/auth/react";

function maskToken(token: string | null | undefined): string {
  if (!token || typeof token !== "string") return String(token);
  if (token.length <= 10) return token;
  return `${token.slice(0, 6)}…${token.slice(-4)}`;
}

export function RouteLogger() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const token = useAuthToken();

  useEffect(() => {
    const qp = searchParams?.toString();
    // Route changes and auth token visibility
    // eslint-disable-next-line no-console
    console.debug("MH:route", {
      pathname,
      query: qp ? `?${qp}` : "",
      token: token === undefined ? "undefined" : token === null ? "null" : maskToken(token),
    });
  }, [pathname, searchParams, token]);

  return null;
}


