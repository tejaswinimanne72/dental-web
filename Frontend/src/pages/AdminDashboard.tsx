// src/pages/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  Package,
  LineChart,
  ClipboardList,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE   = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const ADMIN_API  = `${API_BASE}/api/admin`;

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("authToken");
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}
async function readJsonOrText(res: Response): Promise<any> {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return { message: await res.text() };
}

type DashboardSummary = {
  todayAppointments: number;
  todayAppointmentsDelta: number;
  lowStockItems: number;
  todaysRevenue: number;
  todaysRevenueDeltaPercent: number | null;
  activeCases: number;
  casePipeline: { new: number; inTreatment: number; awaitingFollowUp: number };
  patientSnapshot: { newPatientsToday: number; returningPatientsToday: number; cancelledAppointmentsToday: number };
  asOf: string;
};

/* ── Shared style tokens ── */
const cardBase =
  "rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 shadow-[0_2px_16px_-6px_rgba(15,23,42,0.10)] overflow-hidden";

type KpiCardProps = {
  label: string;
  value: string | number;
  sub: React.ReactNode;
  Icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  accentColor: string; // tailwind border-top color class
  href?: string;
};

const KpiCard: React.FC<KpiCardProps> = ({ label, value, sub, Icon, iconBg, iconColor, accentColor, href }) => (
  <div className={`${cardBase} flex flex-col gap-3 p-5 relative`}>
    {/* Top accent bar */}
    <div className={`absolute top-0 left-0 right-0 h-[3px] ${accentColor}`} />
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</span>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon size={17} className={iconColor} />
      </div>
    </div>
    <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight leading-none">{value}</p>
    <div className="text-xs text-slate-500 dark:text-slate-400">{sub}</div>
    {href && (
      <Link to={href} className="mt-auto inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition pt-2 border-t border-slate-100 dark:border-slate-800">
        View details <ArrowRight size={12} />
      </Link>
    )}
  </div>
);

export const AdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading]  = useState(true);
  const [error,   setError]    = useState<string | null>(null);
  const userName = localStorage.getItem("userName") || "Admin";

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true); setError(null);
        const res  = await fetch(`${ADMIN_API}/dashboard-summary`, { headers: getAuthHeaders(), signal: ac.signal });
        const data = await readJsonOrText(res);
        if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
        setSummary(data);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setError(e?.message || "Failed to load dashboard.");
      } finally { setLoading(false); }
    })();
    return () => ac.abort();
  }, []);

  const fmtRev = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const delta  = summary?.todayAppointmentsDelta ?? 0;
  const revDelta = summary?.todaysRevenueDeltaPercent;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">

        {/* ── HEADER BANNER ── */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 shadow-lg">
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -bottom-10 left-10 w-40 h-40 rounded-full bg-white/5 blur-2xl" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-indigo-200 mb-1">Executive overview</p>
              <h1 className="text-2xl font-bold text-white leading-tight">
                Good to see you, <span className="text-indigo-100">{userName}</span>.
              </h1>
              <p className="mt-1 text-sm text-indigo-200/80 max-w-xl">
                Live snapshot of appointments, inventory, revenue, and active cases.
              </p>
              {summary && (
                <p className="mt-2 text-[11px] text-indigo-300/70 font-mono">As of {summary.asOf}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur">
                <Activity size={12} className="text-emerald-300" />
                {loading ? "Loading…" : "Live dashboards active"}
              </span>
              {error && <span className="text-[11px] text-rose-300">{error}</span>}
            </div>
          </div>
        </div>

        {/* ── KPI CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
          <KpiCard
            label="Today's appointments"
            value={loading ? "—" : (summary?.todayAppointments ?? 0)}
            sub={loading ? "Loading…" : (
              <span className={`inline-flex items-center gap-1 font-semibold ${delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {delta >= 0 ? "+" : ""}{delta} vs last week
              </span>
            )}
            Icon={CalendarDays}
            iconBg="bg-emerald-50 dark:bg-emerald-500/12"
            iconColor="text-emerald-600 dark:text-emerald-400"
            accentColor="bg-emerald-500"
            href="/admin/appointments"
          />
          <KpiCard
            label="Low-stock items"
            value={loading ? "—" : (summary?.lowStockItems ?? 0)}
            sub={<span className="text-amber-600 dark:text-amber-400 font-semibold">Inventory agent watching</span>}
            Icon={Package}
            iconBg="bg-amber-50 dark:bg-amber-500/12"
            iconColor="text-amber-600 dark:text-amber-400"
            accentColor="bg-amber-500"
            href="/admin/inventory"
          />
          <KpiCard
            label="Today's revenue"
            value={loading ? "—" : fmtRev(summary?.todaysRevenue ?? 0)}
            sub={loading ? "Loading…" : revDelta != null ? (
              <span className={`inline-flex items-center gap-1 font-semibold ${revDelta >= 0 ? "text-sky-600 dark:text-sky-400" : "text-rose-500"}`}>
                {revDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {revDelta >= 0 ? "+" : ""}{revDelta.toFixed(1)}% vs 7-day avg
              </span>
            ) : <span className="text-sky-600 dark:text-sky-400 font-semibold">Revenue agent active</span>}
            Icon={LineChart}
            iconBg="bg-sky-50 dark:bg-sky-500/12"
            iconColor="text-sky-600 dark:text-sky-400"
            accentColor="bg-sky-500"
            href="/admin/revenue"
          />
          <KpiCard
            label="Active cases"
            value={loading ? "—" : (summary?.activeCases ?? 0)}
            sub={<span className="text-violet-600 dark:text-violet-400 font-semibold">Case agent tracking</span>}
            Icon={ClipboardList}
            iconBg="bg-violet-50 dark:bg-violet-500/12"
            iconColor="text-violet-600 dark:text-violet-400"
            accentColor="bg-violet-500"
            href="/admin/cases"
          />
        </div>

        {/* ── SECOND ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-4">

          {/* Case pipeline */}
          <div className={`${cardBase} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-500/12 flex items-center justify-center">
                  <ClipboardList size={15} className="text-violet-600 dark:text-violet-400" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">Case pipeline</h2>
              </div>
              <Link to="/admin/case-tracking" className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
                Full view <ArrowRight size={11} />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-3 gap-3">
                {[0,1,2].map(i => <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
              </div>
            ) : summary ? (
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(summary.casePipeline).map(([key, value]) => {
                  const colors: Record<string, string> = {
                    new: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10",
                    inTreatment: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
                    awaitingFollowUp: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10",
                  };
                  const cls = colors[key] || "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800";
                  return (
                    <div key={key} className={`rounded-xl p-3 border border-slate-100 dark:border-slate-800 ${cls.split(" ").slice(2).join(" ")}`}>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 capitalize leading-tight">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className={`mt-1.5 text-2xl font-bold ${cls.split(" ").slice(0,2).join(" ")}`}>{value}</p>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Patient snapshot */}
          <div className={`${cardBase} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/12 flex items-center justify-center">
                  <Users size={15} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">Patients today</h2>
              </div>
              <Link to="/admin/patients" className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                All patients <ArrowRight size={11} />
              </Link>
            </div>

            <ul className="space-y-3">
              {[
                { label: "New patients registered",  value: summary?.patientSnapshot.newPatientsToday,         color: "text-emerald-600 dark:text-emerald-400" },
                { label: "Returning patients",        value: summary?.patientSnapshot.returningPatientsToday,   color: "text-sky-600 dark:text-sky-400"     },
                { label: "Cancelled appointments",   value: summary?.patientSnapshot.cancelledAppointmentsToday, color: "text-amber-600 dark:text-amber-400"  },
              ].map(({ label, value, color }) => (
                <li key={label} className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
                  <span className={`text-base font-bold tabular-nums ${color}`}>
                    {loading ? "—" : (value ?? "—")}
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
