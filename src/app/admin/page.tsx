"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Badge } from "@/components/ui";
import { useAction, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export default function AdminPage() {
  const [rate, setRate] = useState("");
  const updateRate = useAction(api.rates.adminUpdateRate);
  const current = useQuery(api.rates.getCurrentFHARate);
  const [busy, setBusy] = useState(false);

  const onSave = async () => {
    setBusy(true);
    try {
      await updateRate({ rateType: "fha30", rate: parseFloat(rate), source: "manual" });
      setRate("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Admin</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manual FHA Rate Update</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Current: <span className="font-medium">{current ? `${current.rate.toFixed(3)}%` : "Loading…"}</span>
            </div>
            <div>
              <Label htmlFor="rate">New rate (%)</Label>
              <Input id="rate" placeholder="e.g., 6.875" value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
            <Button onClick={onSave} disabled={busy || !rate}>Save</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rate Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {current && (
              <>
                <div>Source: <Badge variant="outline">{current.source}</Badge></div>
                <div>Last Updated: {new Date(current.lastUpdated).toLocaleString()}</div>
                {current.isStale && <div className="text-amber-600">Warning: Rate is stale</div>}
                {current.wasFallbackUsed && <div className="text-amber-600">Using fallback source</div>}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


