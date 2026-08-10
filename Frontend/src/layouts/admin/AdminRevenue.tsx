// src/layouts/admin/AdminRevenue.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart as LineChartIcon,
  ArrowUpRight as ArrowUpRightIcon,
  ArrowDownRight as ArrowDownRightIcon,
  RefreshCcw as RefreshIcon,
  Sparkles as SparklesIcon,
  AlertTriangle as AlertTriangleIcon,
  Info as InfoIcon,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const ADMIN_API = `${API_BASE}/api/admin`;

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("authToken") || localStorage.getItem("token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

type RevenueDashboard = {
  thisMonthTotal: number;
  pendingOverdue: number;
  avgPerDay: number;
  growthPercent: number | null;
  last6Months: { label: string; value: number }[];
  breakdown?: {
    PROCEDURE: number;
    MATERIAL: number;
    APPARATUS: number;
  };
  inventory?: {
    totalValue: number;
    lowStockCount: number;
  };
  // Optional: if backend ever returns it, we show it (agentic)
  aiSummary?: string | null;
};

type LoadState = "idle" | "loading" | "ready" | "error";

function safeNum(v: any, fallback = 0) {
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : fallback;
}

function safeStr(v: any, fallback = "") {
  if (v == null) return fallback;
  return String(v);
}

function inr(n: number) {
  // If you later support multi-currency, change this to use a currency from API.
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function normalizeDashboard(raw: any): RevenueDashboard {
  const last6 = Array.isArray(raw?.last6Months) ? raw.last6Months : [];
  const normalizedLast6 = last6
    .filter(Boolean)
    .map((x: any) => ({
      label: safeStr(x?.label, ""),
      value: safeNum(x?.value, 0),
    }))
    .filter((x: any) => x.label);

  // If breakdown is in totals (from GET /revenue/summary) or direct
  const rawBreakdown = raw?.totals?.breakdown || raw?.breakdown;
  const breakdown = {
    PROCEDURE: safeNum(rawBreakdown?.PROCEDURE, 0),
    MATERIAL: safeNum(rawBreakdown?.MATERIAL, 0),
    APPARATUS: safeNum(rawBreakdown?.APPARATUS, 0),
  };

  const thisMonth = safeNum(raw?.thisMonthTotal ?? raw?.totals?.totalPaid, 0);
  const pending = safeNum(raw?.pendingOverdue ?? raw?.totals?.totalPending, 0);
  const avg = safeNum(raw?.avgPerDay, 0);

  return {
    thisMonthTotal: thisMonth,
    pendingOverdue: pending,
    avgPerDay: avg || (thisMonth / 30), // fallback if not provided
    growthPercent:
      raw?.growthPercent === null || raw?.growthPercent === undefined
        ? null
        : safeNum(raw?.growthPercent, 0),
    last6Months: normalizedLast6,
    breakdown,
    inventory: {
      totalValue: safeNum(raw?.inventory?.totalValue, 0),
      lowStockCount: safeNum(raw?.inventory?.lowStockCount, 0),
    },
    aiSummary: raw?.aiSummary ?? raw?.insights ?? raw?.forecast?.ai_summary ?? null,
  };
}

const surface =
  "rounded-2xl border border-slate-200/80 dark:border-slate-900 bg-white/90 dark:bg-slate-950/90 shadow-[0_18px_55px_-40px_rgba(15,23,42,0.35)]";

const pill =
  "inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300";

const softText = "text-slate-600 dark:text-slate-300";

const SkeletonBlock: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={
      "animate-pulse rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/80 dark:bg-slate-900/50 " +
      className
    }
  >
    <div className="p-4">
      <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800 mb-2" />
      <div className="h-7 w-40 rounded bg-slate-200 dark:bg-slate-800" />
    </div>
  </div>
);

export const AdminRevenue: React.FC = () => {
  const [data, setData] = useState<RevenueDashboard | null>(null);
  const [status, setStatus] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const fetchRevenue = useCallback(async () => {
    try {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus("loading");
      setError(null);

      const res = await fetch(`${ADMIN_API}/revenue-dashboard`, {
        headers: getAuthHeaders(),
        signal: controller.signal,
      });

      // Auth / permission
      if (res.status === 401) {
        setStatus("error");
        setError("Session expired. Please log in again.");
        return;
      }
      if (res.status === 403) {
        setStatus("error");
        setError("You don’t have permission to view revenue data.");
        return;
      }

      const ct = res.headers.get("content-type") || "";
      const body = ct.includes("application/json")
        ? await res.json().catch(() => ({}))
        : { message: await res.text().catch(() => "") };

      if (!res.ok) {
        const msg = body?.message || `Failed to load revenue data (status ${res.status}).`;
        throw new Error(msg);
      }

      const normalized = normalizeDashboard(body);
      setData(normalized);
      setStatus("ready");
      setLastUpdatedAt(new Date().toLocaleString());
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("AdminRevenue error:", err);
      setStatus("error");
      setError(err?.message || "Failed to load revenue data.");
    }
  }, []);

  useEffect(() => {
    fetchRevenue();
    return () => abortRef.current?.abort();
  }, [fetchRevenue]);

  const chart = useMemo(() => {
    const points = data?.last6Months || [];
    const maxVal = Math.max(0, ...points.map((p) => safeNum(p.value, 0)));
    return { points, maxVal };
  }, [data]);

  const insights = useMemo(() => {
    if (!data) return [];

    const items: Array<{ tone: "good" | "warn" | "info"; title: string; message: string }> = [];

    // Optional AI summary from backend
    if (data.aiSummary) {
      items.push({
        tone: "info",
        title: "AI summary",
        message: String(data.aiSummary),
      });
    } else {
      // “Agentic” insights derived from metrics (no extra API needed)
      if (data.pendingOverdue > 0) {
        items.push({
          tone: "warn",
          title: "Overdue attention",
          message: `There is ${inr(data.pendingOverdue)} pending/overdue. Consider reminders and follow-ups today.`,
        });
      } else {
        items.push({
          tone: "good",
          title: "A/R looks healthy",
          message: "No pending/overdue amount flagged in the dashboard right now.",
        });
      }

      if (data.growthPercent != null) {
        if (data.growthPercent >= 0) {
          items.push({
            tone: "good",
            title: "Trend is positive",
            message: `Month-over-month growth is +${data.growthPercent.toFixed(1)}%. Keep the same cadence.`,
          });
        } else {
          items.push({
            tone: "warn",
            title: "Trend dipped",
            message: `Month-over-month is ${data.growthPercent.toFixed(1)}%. Check cancellations, no-shows, and unbilled procedures.`,
          });
        }
      } else {
        items.push({
          tone: "info",
          title: "Trend baseline",
          message: "Not enough history to compute growth yet. Keep recording invoices for accurate trends.",
        });
      }
    }

    return items.slice(0, 3);
  }, [data]);

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className={pill}>
            <LineChartIcon size={14} />
            <span>Revenue</span>
          </div>

          <h1 className="mt-2 text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Revenue & performance
          </h1>

          <p className={"mt-1 text-sm " + softText}>
            Track revenue, trends, and overdue amounts—powered by your clinic’s billing + agent signals.
          </p>

          {lastUpdatedAt && status === "ready" && (
            <p className="mt-1 text-[11px] text-slate-400">
              Last updated: <span className="font-medium text-slate-500 dark:text-slate-400">{lastUpdatedAt}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchRevenue}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
          >
            <RefreshIcon size={14} className={status === "loading" ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-rose-200/70 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/30 px-4 py-3 text-xs text-rose-700 dark:text-rose-200">
          {error}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {status === "loading" && (
          <>
            <SkeletonBlock />
            <SkeletonBlock />
            <SkeletonBlock />
          </>
        )}

        {status !== "loading" && (
          <>
            <div className={surface + " p-4"}>
              <p className="text-xs text-slate-500 dark:text-slate-400">This month</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <span className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {data ? inr(data.thisMonthTotal) : "—"}
                </span>

                {data && data.growthPercent != null && (
                  <span
                    className={
                      "inline-flex items-center gap-1 text-xs font-semibold " +
                      (data.growthPercent >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400")
                    }
                  >
                    {data.growthPercent >= 0 ? <ArrowUpRightIcon size={14} /> : <ArrowDownRightIcon size={14} />}
                    {Math.abs(data.growthPercent).toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                Based on invoices created/paid this month.
              </p>
            </div>

            <div className={surface + " p-4"}>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pending / overdue</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <span className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {data ? inr(data.pendingOverdue) : "—"}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  <ArrowDownRightIcon size={14} />
                  Needs attention
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                Use reminders and follow-ups for overdue balances.
              </p>
            </div>

            <div className={surface + " p-4"}>
              <p className="text-xs text-slate-500 dark:text-slate-400">Avg. revenue / day</p>
              <div className="mt-1">
                <span className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {data ? inr(data.avgPerDay) : "—"}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                Smooths daily variation for quick planning.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Revenue Breakdown */}
      {status === 'ready' && data?.breakdown && (
        <div className={surface + " p-5"}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Revenue Breakdown</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Distribution by charge type</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300">Procedures</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className="text-slate-600 dark:text-slate-300">Apparatus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600 dark:text-slate-300">Materials</span>
              </div>
            </div>
          </div>

          <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden flex shadow-inner">
            {(() => {
              const { PROCEDURE, APPARATUS, MATERIAL } = data.breakdown!;
              const total = PROCEDURE + APPARATUS + MATERIAL || 1;
              const pPct = (PROCEDURE / total) * 100;
              const aPct = (APPARATUS / total) * 100;
              const mPct = (MATERIAL / total) * 100;

              return (
                <>
                  <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${pPct}%` }} title={`Procedures: ${inr(PROCEDURE)}`} />
                  <div className="h-full bg-sky-500 transition-all duration-700" style={{ width: `${aPct}%` }} title={`Apparatus: ${inr(APPARATUS)}`} />
                  <div className="h-full bg-amber-500 transition-all duration-700" style={{ width: `${mPct}%` }} title={`Materials: ${inr(MATERIAL)}`} />
                </>
              );
            })()}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-900 pt-4">
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Procedures</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{inr(data.breakdown.PROCEDURE)}</p>
            </div>
            <div className="text-center border-x border-slate-100 dark:border-slate-900">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Apparatus</p>
              <p className="text-sm font-bold text-sky-600 dark:text-sky-400 mt-0.5">{inr(data.breakdown.APPARATUS)}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Materials</p>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">{inr(data.breakdown.MATERIAL)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className={surface + " p-4"}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <SparklesIcon size={16} className="text-emerald-500 dark:text-emerald-300" />
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Insights</p>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
            <InfoIcon size={12} />
            Agent-assisted signals
          </span>
        </div>

        {status === "loading" ? (
          <div className="space-y-2">
            <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </div>
        ) : !data ? (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Revenue insights will appear once invoices and payments are recorded.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insights.map((it, idx) => (
              <div
                key={idx}
                className={
                  "rounded-xl border px-3 py-3 text-xs " +
                  (it.tone === "good"
                    ? "border-emerald-200/80 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-500/10"
                    : it.tone === "warn"
                      ? "border-amber-200/80 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/10"
                      : "border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40")
                }
              >
                <div className="flex items-start gap-2">
                  {it.tone === "warn" ? (
                    <AlertTriangleIcon size={14} className="mt-[1px] text-amber-600 dark:text-amber-300" />
                  ) : (
                    <InfoIcon size={14} className="mt-[1px] text-slate-500 dark:text-slate-300" />
                  )}
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">{it.title}</p>
                    <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">{it.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trend chart */}
      <div className={surface + " p-5"}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Last 6 months</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {data?.last6Months?.length ? "Revenue trend" : "Waiting for data"}
          </p>
        </div>

        <div className="h-44 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/60 flex items-end gap-2 px-4 pb-3">
          {status === "loading" ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-8 rounded-full bg-slate-300/70 dark:bg-slate-700/80 h-1/2 animate-pulse" />
                <div className="h-3 w-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            ))
          ) : !data || chart.points.length === 0 ? (
            <div className="w-full text-center text-xs text-slate-500 dark:text-slate-400">
              No trend data yet. Once invoices are generated, this chart will populate automatically.
            </div>
          ) : (
            chart.points.map((m, i) => {
              const max = chart.maxVal || 0;
              const v = safeNum(m.value, 0);
              // 18% min visual height, 100% max
              const heightPct = max > 0 ? Math.min(100, (v / max) * 82 + 18) : 18;

              // label: "2026-01" -> "01" or "Jan"
              const label = safeStr(m.label, "").slice(-2);

              return (
                <div key={m.label + i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-8 rounded-full bg-gradient-to-t from-slate-300/80 via-sky-400/80 to-emerald-400/90 dark:from-slate-700/80 dark:via-sky-500/85 dark:to-emerald-400/95"
                    style={{ height: `${heightPct}%` }}
                    title={`${m.label}: ${inr(v)}`}
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{label}</span>
                </div>
              );
            })
          )}
        </div>

        {data && chart.points.length > 0 && (
          <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
            Tip: Hover a bar to see the exact amount.
          </p>
        )}
      </div>
      {/* Inventory & Costs Integration */}
      <div className={surface + " p-5"}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
              <SparklesIcon size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Inventory & Stock Costs</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Track material consumption and predict replenishment needs.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.location.hash = '/admin/inventory'}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 px-4 py-2 text-xs font-semibold shadow-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition"
            >
              Inventory Management
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-4 flex flex-col items-center justify-center text-center">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Stock Value</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">{data?.inventory ? inr(data.inventory.totalValue) : "—"}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">Capital invested in stock</p>
          </div>
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-4 flex flex-col items-center justify-center text-center">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Low Stock Items</p>
            <p className={`text-2xl font-bold mt-1 ${data?.inventory?.lowStockCount ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {data?.inventory?.lowStockCount ?? "—"}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Items below reorder point</p>
          </div>
        </div>
      </div>
    </section>
  );
};
