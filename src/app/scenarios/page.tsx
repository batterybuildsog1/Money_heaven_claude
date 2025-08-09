"use client";

import { useEffect, useMemo, useState } from "react";
import { useScenarios } from "@/hooks/useScenarios";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Badge } from "@/components/ui";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Download, Search, Trash2, ArrowRightLeft } from "lucide-react";
import { CompareDrawer } from "@/components/scenarios/CompareDrawer";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useCalculatorStore } from "@/store/calculator";
import { useAuthToken } from "@convex-dev/auth/react";

export default function ScenariosPage() {
  const token = useAuthToken();
  const isAuthenticated = useMemo(() => token !== null && token !== undefined, [token]);
  const { scenarios, remove, isLoading } = useScenarios();
  const [query, setQuery] = useState("");
  const [minLoan, setMinLoan] = useState("");
  const [maxLoan, setMaxLoan] = useState("");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { success, error } = useToast();
  const router = useRouter();
  const { updateUserInputs, updateCompensatingFactors, setResults, setUIState } = useCalculatorStore();

  type SortKey = "name" | "location" | "maxLoan" | "dti" | "down" | "created";
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [visible, setVisible] = useState({ dti: true, down: true, created: true });

  // Persist filters/sort/visible to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("scenarios-ui");
      if (saved) {
        const parsed = JSON.parse(saved);
        setQuery(parsed.query ?? "");
        setMinLoan(parsed.minLoan ?? "");
        setMaxLoan(parsed.maxLoan ?? "");
        setSortKey(parsed.sortKey ?? "created");
        setSortDir(parsed.sortDir ?? "desc");
        setVisible(parsed.visible ?? { dti: true, down: true, created: true });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const payload = { query, minLoan, maxLoan, sortKey, sortDir, visible };
    try { localStorage.setItem("scenarios-ui", JSON.stringify(payload)); } catch {}
  }, [query, minLoan, maxLoan, sortKey, sortDir, visible]);

  const filtered = useMemo(() => {
    if (!isAuthenticated) return [];
    return (scenarios || []).filter((s: any) => {
      const text = `${s.name ?? ""} ${s.inputs?.location ?? ""}`.toLowerCase();
      const matchText = query ? text.includes(query.toLowerCase()) : true;
      const loan = s.results?.maxLoanAmount ?? 0;
      const matchMin = minLoan ? loan >= parseFloat(minLoan) : true;
      const matchMax = maxLoan ? loan <= parseFloat(maxLoan) : true;
      return matchText && matchMin && matchMax;
    });
  }, [scenarios, query, minLoan, maxLoan, isAuthenticated]);

  // Clamp page when filter results change (functional update avoids page dep)
  useEffect(() => {
    const total = Math.max(1, Math.ceil(filtered.length / pageSize));
    setPage((p) => {
      const clamped = Math.min(Math.max(1, p), total);
      return clamped === p ? p : clamped;
    });
  }, [filtered.length, pageSize]);

  const sorted = useMemo(() => {
    const arr = filtered.slice();
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a: any, b: any) => {
      const get = (s: any): number | string => {
        switch (sortKey) {
          case "name": return s.name ?? "";
          case "location": return s.inputs?.location ?? "";
          case "maxLoan": return s.results?.maxLoanAmount ?? 0;
          case "dti": return s.results?.debtToIncomeRatio ?? 0;
          case "down": return s.inputs?.downPaymentPercent ?? 0;
          case "created": return s._creationTime ?? 0;
        }
      };
      const va = get(a), vb = get(b);
      if (typeof va === "string" && typeof vb === "string") return va.localeCompare(vb) * dir;
      return ((va as number) - (vb as number)) * dir;
    });
    return arr;
  }, [filtered, sortDir, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page]);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(-2);
      if (next.length === 2) setDrawerOpen(true);
      return next;
    });
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAllVisible = () => {
    const ids = sorted.map((s: any) => s._id);
    const allSelected = ids.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? selectedIds.filter((id) => !ids.includes(id)) : Array.from(new Set([...selectedIds, ...ids])));
  };

  const exportCsv = () => {
    const rows = [
      ["Name", "Location", "Income", "MaxLoan", "DTI", "Created"],
      ...filtered.map((s: any) => [
        s.name ?? "",
        s.inputs?.location ?? "",
        s.inputs?.income ?? "",
        s.results?.maxLoanAmount ?? "",
        s.results?.debtToIncomeRatio ?? "",
        new Date(s._creationTime).toISOString(),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => JSON.stringify(c ?? "")).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scenarios.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSelected = () => {
    const rows = [
      ["Name", "Location", "Income", "MaxLoan", "DTI", "Created"],
      ...sorted
        .filter((s: any) => selectedIds.includes(s._id))
        .map((s: any) => [
          s.name ?? "",
          s.inputs?.location ?? "",
          s.inputs?.income ?? "",
          s.results?.maxLoanAmount ?? "",
          s.results?.debtToIncomeRatio ?? "",
          new Date(s._creationTime).toISOString(),
        ]),
    ];
    const csv = rows.map((r) => r.map((c) => JSON.stringify(c ?? "")).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scenarios-selected.csv";
    a.click();
    URL.revokeObjectURL(url);
    success("Exported CSV");
  };

  const deleteSelected = async () => {
    try {
      // cast id because selectedIds are string from UI, Convex expects Id<"scenarios">
      for (const id of selectedIds) await remove(id as any);
      success("Deleted selected");
      setSelectedIds([]);
    } catch (e) {
      error("Delete failed");
    }
  };

  const loadToCalculator = (s: any) => {
    try {
      updateUserInputs(s.inputs || {});
      updateCompensatingFactors(s.compensatingFactors || {});
      if (s.results) setResults(s.results);
      setUIState({ showResults: true });
      success("Loaded in calculator");
      router.push("/calculator");
    } catch (e) {
      error("Load failed");
    }
  };

  if (token === undefined) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 text-center">
        <p className="text-muted-foreground">Loading authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Access Denied</h1>
        <p className="text-muted-foreground">Please log in to view your saved scenarios.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Scenarios</h1>
          <p className="text-sm text-muted-foreground">Search, filter, compare, and export your saved calculations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportCsv} className="inline-flex items-center gap-2" variant="outline">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <Label htmlFor="q">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="q" placeholder="Name or location" className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="min">Min Loan</Label>
            <Input id="min" inputMode="decimal" placeholder="e.g., 300000" value={minLoan} onChange={(e) => setMinLoan(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="max">Max Loan</Label>
            <Input id="max" inputMode="decimal" placeholder="e.g., 700000" value={maxLoan} onChange={(e) => setMaxLoan(e.target.value)} />
          </div>
          <div>
            <Label>Columns</Label>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <label className="inline-flex items-center gap-1"><input type="checkbox" checked={visible.dti} onChange={(e) => setVisible({ ...visible, dti: e.target.checked })} /> DTI</label>
              <label className="inline-flex items-center gap-1"><input type="checkbox" checked={visible.down} onChange={(e) => setVisible({ ...visible, down: e.target.checked })} /> Down</label>
              <label className="inline-flex items-center gap-1"><input type="checkbox" checked={visible.created} onChange={(e) => setVisible({ ...visible, created: e.target.checked })} /> Created</label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportSelected} disabled={selectedIds.length === 0}>
            <Download className="mr-1 h-3 w-3" /> Export Selected
          </Button>
          <Button variant="outline" size="sm" onClick={deleteSelected} disabled={selectedIds.length === 0}>
            <Trash2 className="mr-1 h-3 w-3 text-destructive" /> Delete Selected
          </Button>
        </div>
        <div className="text-muted-foreground">{selectedIds.length} selected</div>
      </div>

      {isLoading ? (
        <div className="grid gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-muted/40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground">No scenarios found.</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH className="w-10"><input type="checkbox" aria-label="Select all" onChange={selectAllVisible} /></TH>
                  <TH><button className="underline-offset-2 hover:underline" onClick={() => (setSortKey("name"), setSortDir(sortKey === "name" && sortDir === "asc" ? "desc" : "asc"))}>Name</button></TH>
                  <TH><button className="underline-offset-2 hover:underline" onClick={() => (setSortKey("location"), setSortDir(sortKey === "location" && sortDir === "asc" ? "desc" : "asc"))}>Location</button></TH>
                  <TH><button className="underline-offset-2 hover:underline" onClick={() => (setSortKey("maxLoan"), setSortDir(sortKey === "maxLoan" && sortDir === "asc" ? "desc" : "asc"))}>Max Loan</button></TH>
                  {visible.dti && <TH><button className="underline-offset-2 hover:underline" onClick={() => (setSortKey("dti"), setSortDir(sortKey === "dti" && sortDir === "asc" ? "desc" : "asc"))}>DTI</button></TH>}
                  {visible.down && <TH><button className="underline-offset-2 hover:underline" onClick={() => (setSortKey("down"), setSortDir(sortKey === "down" && sortDir === "asc" ? "desc" : "asc"))}>Down Pmt</button></TH>}
                  {visible.created && <TH><button className="underline-offset-2 hover:underline" onClick={() => (setSortKey("created"), setSortDir(sortKey === "created" && sortDir === "asc" ? "desc" : "asc"))}>Created</button></TH>}
                  <TH className="w-24">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {paged.map((s: any) => (
                  <TR key={s._id}>
                    <TD>
                      <input type="checkbox" aria-label="Select row" checked={selectedIds.includes(s._id)} onChange={() => toggleSelected(s._id)} />
                    </TD>
                    <TD className="font-medium">{s.name ?? `Scenario ${String(s._id).slice(-4)}`}</TD>
                    <TD><Badge variant="outline">{s.inputs?.location ?? "Unknown"}</Badge></TD>
                    <TD className="tabular-nums">{formatCurrency(s.results?.maxLoanAmount ?? 0)}</TD>
                    {visible.dti && <TD>{s.results?.debtToIncomeRatio ? `${s.results.debtToIncomeRatio.toFixed(1)}%` : "—"}</TD>}
                    {visible.down && <TD>{s.inputs?.downPaymentPercent ? `${s.inputs.downPaymentPercent}%` : "—"}</TD>}
                    {visible.created && <TD className="text-xs text-muted-foreground">{new Date(s._creationTime).toLocaleString()}</TD>}
                    <TD>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => loadToCalculator(s)}>
                          Load
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggleCompare(s._id)}>
                          <ArrowRightLeft className="mr-1 h-3 w-3" /> Compare
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(s._id as any)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!isLoading && filtered.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <CompareDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        left={scenarios.find((x: any) => x._id === compareIds[0])}
        right={scenarios.find((x: any) => x._id === compareIds[1])}
        onLoadLeft={(s) => loadToCalculator(s)}
        onLoadRight={(s) => loadToCalculator(s)}
      />
    </div>
  );
}


