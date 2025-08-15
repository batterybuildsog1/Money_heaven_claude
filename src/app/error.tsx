"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Report error details to console for debugging
    // In production you might send this to an error reporting service
    console.error(error)
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl p-6 text-sm">
      <h2 className="mb-2 text-lg font-semibold">Something went wrong</h2>
      {/* Hide detailed error output from users in production */}
      <p className="text-xs text-muted-foreground">
        Please try again. If the problem persists, contact support.
      </p>
      <button className="mt-4 rounded border px-3 py-1" onClick={() => reset()}>Try again</button>
    </div>
  );
}


