"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export default function DiagnosticsPage() {
  const me = useQuery(api.whoami.me);
  return (
    <div className="mx-auto max-w-2xl p-6 text-sm">
      <h1 className="mb-4 text-xl font-semibold">Diagnostics</h1>
      <div className="mb-4">
        <div className="font-medium">Convex URL</div>
        <pre className="rounded bg-muted p-2 text-xs overflow-auto">{process.env.NEXT_PUBLIC_CONVEX_URL || "(missing)"}</pre>
      </div>
      <div>
        <div className="font-medium">Identity</div>
        <pre className="rounded bg-muted p-2 text-xs overflow-auto">{JSON.stringify(me, null, 2)}</pre>
      </div>
    </div>
  );
}


