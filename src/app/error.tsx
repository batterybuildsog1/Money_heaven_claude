"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Report error details to console for debugging
    // In production you might send this to an error reporting service
    // eslint-disable-next-line no-console
    console.error("💥 App Error Boundary:", { message: error.message, stack: error.stack, digest: error.digest });
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl p-6 text-sm">
      <h2 className="mb-2 text-lg font-semibold">Something went wrong</h2>
      <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">{String(error?.message || error)}</pre>
      {error?.digest && <div className="mt-2 text-xs text-muted-foreground">Digest: {error.digest}</div>}
      <button className="mt-4 rounded border px-3 py-1" onClick={() => reset()}>Try again</button>
    </div>
  );
}


