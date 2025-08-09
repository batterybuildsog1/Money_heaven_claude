"use client";

import React from "react";
import { KpiTile } from "@/components/ui/kpi/KpiTile";
import { Sparkline } from "@/components/ui/kpi/Sparkline";
import { formatCurrency } from "@/lib/utils";

interface CompareDrawerProps {
  left?: any | null;
  right?: any | null;
  open: boolean;
  onClose: () => void;
  onLoadLeft?: (scenario: any) => void;
  onLoadRight?: (scenario: any) => void;
}

export function CompareDrawer({ left, right, open, onClose, onLoadLeft, onLoadRight }: CompareDrawerProps) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="absolute right-0 top-0 h-full w-full max-w-xl border-l bg-background p-4 shadow-xl animate-slide-in">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Compare Scenarios</h2>
              <button onClick={onClose} className="pressable rounded border px-2 py-1 text-sm">Close</button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ScenarioSummary title="A" scenario={left} compareTo={right} />
              <ScenarioSummary title="B" scenario={right} compareTo={left} />
            </div>

            <div className="mt-6 rounded-xl border bg-card p-4">
              <div className="mb-2 text-xs text-muted-foreground">Monthly Payment Mix (PITI + MIP)</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Breakdown scenario={left} />
                <Breakdown scenario={right} />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                className="pressable rounded border px-3 py-1 text-sm disabled:opacity-50"
                disabled={!left || !onLoadLeft}
                onClick={() => left && onLoadLeft && onLoadLeft(left)}
              >
                Load A in Calculator
              </button>
              <button
                className="pressable rounded border px-3 py-1 text-sm disabled:opacity-50"
                disabled={!right || !onLoadRight}
                onClick={() => right && onLoadRight && onLoadRight(right)}
              >
                Load B in Calculator
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ScenarioSummary({ title, scenario, compareTo }: { title: string; scenario: any | null | undefined; compareTo?: any | null }) {
  if (!scenario) return (
    <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">Select scenario {title}</div>
  );

  const spark = [
    scenario.results?.principalAndInterest ?? 0,
    scenario.results?.propertyTax ?? 0,
    scenario.results?.homeInsurance ?? 0,
    scenario.results?.mip ?? 0,
  ];

  const baseLoan = compareTo?.results?.maxLoanAmount ?? null;
  const loan = scenario.results?.maxLoanAmount ?? 0;
  const loanDelta = baseLoan ? ((loan - baseLoan) / (baseLoan || 1)) * 100 : undefined;

  const baseDti = compareTo?.results?.debtToIncomeRatio ?? null;
  const dti = scenario.results?.debtToIncomeRatio ?? 0;
  const dtiDelta = baseDti ? (dti - baseDti) : undefined; // show absolute p.p. change

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="text-xs text-muted-foreground">{scenario.inputs?.location ?? "Location"}</div>
      <div className="text-base font-semibold truncate">{scenario.name ?? `Scenario ${String(scenario._id).slice(-4)}`}</div>
      <KpiTile label="Max Loan" value={formatCurrency(loan)} delta={loanDelta !== undefined ? { value: loanDelta } : undefined} />
      <KpiTile label="DTI" value={`${(dti).toFixed(1)}%`} delta={dtiDelta !== undefined ? { value: dtiDelta } : undefined} />
      <div className="rounded-lg border p-2">
        <div className="mb-1 text-[10px] text-muted-foreground">Payment components</div>
        <Sparkline data={spark} stroke="var(--chart-2)" />
      </div>
    </div>
  );
}

function Breakdown({ scenario }: { scenario: any | null | undefined }) {
  if (!scenario) return <div className="text-muted-foreground">—</div>;
  const r = scenario.results ?? {};
  const row = (label: string, val: number) => (
    <div className="flex items-center justify-between"><span className="text-muted-foreground">{label}</span><span className="tabular-nums">{formatCurrency(val || 0)}</span></div>
  );
  return (
    <div className="space-y-1">
      {row("P&I", r.principalAndInterest)}
      {row("Property Tax", r.propertyTax)}
      {row("Insurance", r.homeInsurance)}
      {row("MIP", r.mip)}
    </div>
  );
}


