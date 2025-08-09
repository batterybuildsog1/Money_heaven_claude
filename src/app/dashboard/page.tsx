"use client";

import { useMemo } from "react";
import { useScenarios } from "@/hooks/useScenarios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { KpiTile } from "@/components/ui/kpi/KpiTile";
import { Sparkline } from "@/components/ui/kpi/Sparkline";

export default function DashboardPage() {
  const { scenarios, isLoading } = useScenarios();
  const stats = useMemo(() => {
    const count = scenarios.length;
    const avgLoan = count ? scenarios.reduce((s: number, x: any) => s + (x.results?.maxLoanAmount ?? 0), 0) / count : 0;
    const locations = new Set(scenarios.map((s: any) => s.inputs?.location).filter(Boolean));
    const recent = scenarios
      .slice()
      .sort((a: any, b: any) => b._creationTime - a._creationTime)
      .slice(0, 12);
    const spark = recent.map((s: any) => s.results?.maxLoanAmount ?? 0);
    return { count, avgLoan, locations: locations.size, spark };
  }, [scenarios]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Dashboard</h1>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiTile label="Saved Scenarios" value={stats.count} subtitle="All-time" />
            <KpiTile label="Avg Max Loan" value={`$${stats.avgLoan.toFixed(0)}`} subtitle="Across saved" />
            <KpiTile label="Locations Tried" value={stats.locations} subtitle="Unique locations" />
            <div className="rounded-xl border bg-card p-4">
              <div className="mb-1 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Recent Max Loans</div>
                <div className="text-[10px] text-muted-foreground">last 12</div>
              </div>
              <Sparkline data={stats.spark} stroke="var(--chart-1)" />
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {scenarios
                    .slice()
                    .sort((a: any, b: any) => b._creationTime - a._creationTime)
                    .slice(0, 8)
                    .map((s: any) => (
                      <li key={s._id} className="flex items-center justify-between">
                        <span className="truncate">{s.name ?? `Scenario ${String(s._id).slice(-4)}`}</span>
                        <span className="tabular-nums text-muted-foreground">${(s.results?.maxLoanAmount ?? 0).toFixed(0)}</span>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Stats</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Median Max Loan</div>
                  <div className="font-semibold">${median(scenarios.map((s: any) => s.results?.maxLoanAmount ?? 0)).toFixed(0)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Newest Scenario</div>
                  <div className="font-semibold">{newestDate(scenarios)}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function median(values: number[]) {
  const arr = values.filter((n) => typeof n === "number").slice().sort((a, b) => a - b);
  if (arr.length === 0) return 0;
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

function newestDate(list: any[]) {
  if (!list.length) return "—";
  const ts = Math.max(...list.map((x: any) => x._creationTime ?? 0));
  return new Date(ts).toLocaleDateString();
}


